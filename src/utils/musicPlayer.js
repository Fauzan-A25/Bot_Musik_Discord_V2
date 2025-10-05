const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  joinVoiceChannel,
  entersState,
  StreamType,
} = require("@discordjs/voice");
const play = require("play-dl");
const YTDlpWrap = require("yt-dlp-wrap").default;
const QueueManager = require("./queueManager");
const { music } = require("../config/botConfig");
const logger = require("./logger");

// Try to use ffmpeg-static if available
try {
  const ffmpegPath = require("ffmpeg-static");
  process.env.FFMPEG_PATH = ffmpegPath;
  logger.info("Using ffmpeg-static");
} catch (error) {
  logger.warn("ffmpeg-static not found, using system FFmpeg");
}

class MusicPlayer {
  constructor() {
    this.disconnectTimers = new Map();
    this.ytDlpWrap = null;
    this.initializeYtDlp();
  }

  async initializeYtDlp() {
    try {
      logger.info("Initializing yt-dlp...");
      this.ytDlpWrap = new YTDlpWrap();

      // yt-dlp-wrap akan otomatis handle binary
      // Tidak perlu downloadFromGithub()

      // Test if yt-dlp is working
      try {
        const version = await this.ytDlpWrap.getVersion();
        logger.success(`yt-dlp initialized! Version: ${version}`);
      } catch (testError) {
        logger.warn("yt-dlp binary not found, trying to download...");

        // Manual download if needed
        const YTDlpWrap = require("yt-dlp-wrap").default;
        const ytDlpPath = await YTDlpWrap.downloadFromGithub();
        this.ytDlpWrap = new YTDlpWrap(ytDlpPath);

        logger.success("yt-dlp downloaded and initialized!");
      }
    } catch (error) {
      logger.error(`Failed to initialize yt-dlp: ${error.message}`);
      logger.warn("Music playback will not work without yt-dlp");
      logger.info(
        "Please install yt-dlp manually: https://github.com/yt-dlp/yt-dlp"
      );
    }
  }

  async play(queue) {
    if (!queue || queue.isEmpty()) {
      await this.handleQueueEnd(queue);
      return;
    }

    const song = queue.getNextSong();
    if (!song) {
      await this.handleQueueEnd(queue);
      return;
    }

    try {
      queue.currentSong = song;
      queue.isPlaying = true;

      logger.info(`Now playing: ${song.title}`);
      logger.info(`Song URL: ${song.url}`);

      // Create audio resource
      const stream = await this.getAudioStream(song.url);

      if (!stream) {
        throw new Error("Failed to create audio stream");
      }

      const resource = createAudioResource(stream, {
        inlineVolume: true,
        inputType: StreamType.Arbitrary,
      });

      queue.resource = resource;

      // Set volume
      if (resource.volume) {
        resource.volume.setVolume(queue.volume / 100);
      }

      // Play audio
      queue.player.play(resource);

      logger.success(`Playing: ${song.title}`);

      // Send now playing message
      await this.sendNowPlayingMessage(queue, song);
    } catch (error) {
      logger.error(`Error playing song: ${error.message}`);

      const errorMsg = this.getErrorMessage(error);
      queue.textChannel.send(`❌ ${errorMsg}`).catch(console.error);

      setTimeout(() => this.play(queue), 2000);
    }
  }

  async getAudioStream(url) {
    try {
      logger.info(`Getting audio stream for URL: ${url}`);

      if (!this.ytDlpWrap) {
        throw new Error(
          "yt-dlp not initialized. Please install: npm install -g yt-dlp"
        );
      }

      const cleanUrl = url.trim();
      const videoId = this.extractVideoId(cleanUrl);

      if (!videoId) {
        throw new Error("Could not extract video ID");
      }

      const reconstructedUrl = `https://www.youtube.com/watch?v=${videoId}`;
      logger.info(`Using URL: ${reconstructedUrl}`);

      logger.info("Fetching video info with yt-dlp...");

      // Get video info
      const videoInfo = await this.ytDlpWrap.getVideoInfo(reconstructedUrl);

      logger.info(`Video: ${videoInfo.title}`);
      logger.info(`Duration: ${videoInfo.duration}s`);
      logger.info(`Total formats: ${videoInfo.formats.length}`);

      // Try different format selection strategies
      let selectedFormat = null;

      // Strategy 1: Audio-only formats
      const audioOnly = videoInfo.formats.filter(
        (f) =>
          f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none")
      );

      if (audioOnly.length > 0) {
        audioOnly.sort((a, b) => (b.abr || 0) - (a.abr || 0));
        selectedFormat = audioOnly[0];
        logger.info(`Using audio-only format: ${selectedFormat.format_id}`);
      }

      // Strategy 2: Formats with audio (even if they have video)
      if (!selectedFormat) {
        const hasAudio = videoInfo.formats.filter(
          (f) => f.acodec && f.acodec !== "none"
        );

        if (hasAudio.length > 0) {
          hasAudio.sort((a, b) => (b.abr || 0) - (a.abr || 0));
          selectedFormat = hasAudio[0];
          logger.info(`Using format with audio: ${selectedFormat.format_id}`);
        }
      }

      // Strategy 3: Any format with URL
      if (!selectedFormat) {
        const anyFormat = videoInfo.formats.filter((f) => f.url);

        if (anyFormat.length > 0) {
          selectedFormat = anyFormat[0];
          logger.warn(`Using fallback format: ${selectedFormat.format_id}`);
        }
      }

      if (!selectedFormat) {
        logger.error(
          "Available formats:",
          videoInfo.formats.map((f) => ({
            id: f.format_id,
            acodec: f.acodec,
            vcodec: f.vcodec,
            hasUrl: !!f.url,
          }))
        );
        throw new Error("No suitable format found");
      }

      logger.info(
        `Format: ${selectedFormat.format_id} @ ${selectedFormat.abr || "?"}kbps`
      );
      logger.info(`Codec: ${selectedFormat.acodec || "unknown"}`);

      if (!selectedFormat.url) {
        throw new Error("Selected format has no stream URL");
      }

      logger.info("Creating stream from direct URL...");
      logger.info(`Stream URL length: ${selectedFormat.url.length} chars`);

      // Create stream from URL
      const https = require("https");
      const http = require("http");

      return new Promise((resolve, reject) => {
        const protocol = selectedFormat.url.startsWith("https") ? https : http;

        const request = protocol.get(
          selectedFormat.url,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              Accept: "*/*",
              "Accept-Encoding": "gzip, deflate",
              Connection: "keep-alive",
            },
          },
          (response) => {
            if (response.statusCode === 200) {
              logger.success("Stream created successfully!");
              resolve(response);
            } else if (
              response.statusCode === 302 ||
              response.statusCode === 301
            ) {
              logger.info(`Following redirect (${response.statusCode})...`);
              const redirectUrl = response.headers.location;

              if (!redirectUrl) {
                reject(new Error("Redirect location missing"));
                return;
              }

              const redirectProtocol = redirectUrl.startsWith("https")
                ? https
                : http;

              redirectProtocol
                .get(
                  redirectUrl,
                  {
                    headers: {
                      "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                  },
                  (redirectResponse) => {
                    if (redirectResponse.statusCode === 200) {
                      logger.success("Stream created after redirect!");
                      resolve(redirectResponse);
                    } else {
                      reject(
                        new Error(
                          `HTTP ${redirectResponse.statusCode} after redirect`
                        )
                      );
                    }
                  }
                )
                .on("error", reject);
            } else {
              reject(new Error(`HTTP ${response.statusCode}`));
            }
          }
        );

        request.on("error", (error) => {
          logger.error(`Request error: ${error.message}`);
          reject(error);
        });

        request.setTimeout(20000, () => {
          request.destroy();
          reject(new Error("Request timeout (20s)"));
        });
      });
    } catch (error) {
      logger.error(`Stream error: ${error.message}`);

      // Add more context to error
      if (error.message.includes("No suitable format")) {
        throw new Error("Video format not supported or video is unavailable");
      }

      throw error;
    }
  }

  extractVideoId(url) {
    try {
      let match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      if (match && match[1]) return match[1];

      match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) return match[1];

      match = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) return match[1];

      match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) return match[1];

      return null;
    } catch (error) {
      logger.error(`Error extracting video ID: ${error.message}`);
      return null;
    }
  }

  async connect(voiceChannel, textChannel) {
    try {
      logger.info(
        `Connecting to voice channel: ${voiceChannel.name} (${voiceChannel.id})`
      );

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      logger.info("Waiting for voice connection to be ready...");
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      logger.success("Voice connection established successfully");

      const player = createAudioPlayer();
      connection.subscribe(player);

      this.setupPlayerListeners(player, connection, voiceChannel.guild.id);
      this.setupConnectionListeners(connection, voiceChannel.guild.id);

      return { connection, player };
    } catch (error) {
      logger.error(`Connection error: ${error.message}`);
      throw new Error("Failed to connect to voice channel: " + error.message);
    }
  }

  setupPlayerListeners(player, connection, guildId) {
    player.on(AudioPlayerStatus.Idle, () => {
      logger.info("Player is idle, attempting to play next song...");
      const queue = QueueManager.get(guildId);
      if (queue) {
        setTimeout(() => this.play(queue), 1000);
      }
    });

    player.on(AudioPlayerStatus.Playing, () => {
      this.clearDisconnectTimer(guildId);
      logger.info(`Audio player is now playing in guild ${guildId}`);
    });

    player.on(AudioPlayerStatus.Paused, () => {
      logger.info(`Audio player paused in guild ${guildId}`);
    });

    player.on(AudioPlayerStatus.Buffering, () => {
      logger.info(`Audio player buffering in guild ${guildId}`);
    });

    player.on("error", (error) => {
      logger.error(`Audio player error in guild ${guildId}:`);
      logger.error(`  Message: ${error.message}`);
      logger.error(`  Resource: ${error.resource ? "Yes" : "No"}`);

      const queue = QueueManager.get(guildId);
      if (queue) {
        const errorMsg = this.getErrorMessage(error);
        queue.textChannel.send(`❌ ${errorMsg}`).catch(console.error);

        // Try next song
        setTimeout(() => this.play(queue), 2000);
      }
    });
  }

  setupConnectionListeners(connection, guildId) {
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      logger.warn(`Voice connection disconnected in guild ${guildId}`);

      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        logger.info("Voice connection recovered");
      } catch (error) {
        logger.error("Voice connection could not be recovered, destroying...");
        connection.destroy();
        QueueManager.delete(guildId);
      }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      logger.warn(`Voice connection destroyed in guild ${guildId}`);
      QueueManager.delete(guildId);
    });

    connection.on("error", (error) => {
      logger.error(
        `Voice connection error in guild ${guildId}: ${error.message}`
      );
    });

    connection.on("stateChange", (oldState, newState) => {
      logger.info(
        `Voice connection state changed: ${oldState.status} -> ${newState.status}`
      );
    });
  }

  async handleQueueEnd(queue) {
    if (!queue) return;

    logger.info("Queue ended");
    queue.isPlaying = false;
    queue.currentSong = null;

    if (music.leaveOnEnd) {
      this.setDisconnectTimer(queue.guildId);
    }
  }

  setDisconnectTimer(guildId) {
    this.clearDisconnectTimer(guildId);

    logger.info(`Setting disconnect timer for guild ${guildId}`);

    const timer = setTimeout(() => {
      const queue = QueueManager.get(guildId);
      if (queue && !queue.isPlaying) {
        logger.info(`Disconnecting from guild ${guildId} due to inactivity`);
        queue.textChannel
          .send("👋 Left the voice channel due to inactivity.")
          .catch(console.error);
        QueueManager.delete(guildId);
      }
    }, music.disconnectTime);

    this.disconnectTimers.set(guildId, timer);
  }

  clearDisconnectTimer(guildId) {
    if (this.disconnectTimers.has(guildId)) {
      clearTimeout(this.disconnectTimers.get(guildId));
      this.disconnectTimers.delete(guildId);
      logger.info(`Cleared disconnect timer for guild ${guildId}`);
    }
  }

  async sendNowPlayingMessage(queue, song) {
    try {
      const { EmbedBuilder } = require("discord.js");

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle(`🎵 Now Playing`)
        .setDescription(`**[${song.title}](${song.url})**`)
        .addFields(
          {
            name: "⏱️ Duration",
            value: song.durationFormatted || "Unknown",
            inline: true,
          },
          {
            name: "👤 Requested by",
            value: song.requestedBy.toString(),
            inline: true,
          },
          { name: "🔊 Volume", value: `${queue.volume}%`, inline: true }
        )
        .setTimestamp();

      if (song.thumbnail) {
        embed.setThumbnail(song.thumbnail);
      }

      if (song.author) {
        embed.setFooter({ text: `Artist: ${song.author}` });
      }

      if (queue.songs.length > 0) {
        const upNext = queue.songs
          .slice(0, 3)
          .map((s, i) => `${i + 1}. ${s.title}`)
          .join("\n");

        embed.addFields({
          name: "📜 Up Next",
          value: upNext || "Queue is empty",
        });
      }

      await queue.textChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.error(`Failed to send now playing message: ${error.message}`);
    }
  }

  getErrorMessage(error) {
    const message = error.message.toLowerCase();

    if (message.includes("ffmpeg")) {
      return "⚠️ FFmpeg error. Make sure FFmpeg is installed.";
    }
    if (message.includes("403")) {
      return "⚠️ YouTube blocked the request (403 Forbidden).";
    }
    if (message.includes("410")) {
      return "⚠️ Video no longer available (410 Gone).";
    }
    if (message.includes("invalid url") || message.includes("video id")) {
      return "⚠️ Invalid YouTube URL or video not found.";
    }
    if (message.includes("stream")) {
      return "⚠️ Failed to create audio stream. The video might be unavailable.";
    }
    if (message.includes("sign in")) {
      return "⚠️ YouTube requires sign-in. This video cannot be played.";
    }
    if (message.includes("not initialized")) {
      return "⚠️ Music system is initializing. Please try again in a moment.";
    }
    if (message.includes("timeout")) {
      return "⚠️ Request timeout. Please try again.";
    }

    return `An error occurred: ${error.message}`;
  }

  pause(guildId) {
    const queue = QueueManager.get(guildId);
    if (queue && queue.player) {
      queue.player.pause();
      logger.info(`Player paused in guild ${guildId}`);
      return true;
    }
    return false;
  }

  resume(guildId) {
    const queue = QueueManager.get(guildId);
    if (queue && queue.player) {
      queue.player.unpause();
      logger.info(`Player resumed in guild ${guildId}`);
      return true;
    }
    return false;
  }

  stop(guildId) {
    const queue = QueueManager.get(guildId);
    if (queue) {
      queue.clearQueue();
      queue.player.stop();
      QueueManager.delete(guildId);
      logger.info(`Player stopped and queue cleared in guild ${guildId}`);
      return true;
    }
    return false;
  }

  skip(guildId) {
    const queue = QueueManager.get(guildId);
    if (queue && queue.player) {
      queue.player.stop();
      logger.info(`Skipped song in guild ${guildId}`);
      return true;
    }
    return false;
  }
}

module.exports = new MusicPlayer();
