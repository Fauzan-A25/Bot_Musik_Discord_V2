const logger = require("./logger");

class Queue {
  constructor(guildId, textChannel, voiceChannel) {
    this.guildId = guildId;
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.connection = null;
    this.player = null;
    this.songs = [];
    this.currentSong = null;
    this.volume = 50;
    this.loop = 0; // 0 = off, 1 = song, 2 = queue
    this.isPlaying = false;
    this.resource = null;
  }

  addSong(song) {
    this.songs.push(song);
  }

  addSongs(songs) {
    this.songs.push(...songs);
  }

  getNextSong() {
    // Loop mode: SONG (1) - keep playing current song
    if (this.loop === 1 && this.currentSong) {
      logger.info("Queue: Returning current song for loop");
      return this.currentSong;
    }

    // Loop mode: QUEUE (2) - if no songs, return current
    if (this.loop === 2 && this.songs.length === 0 && this.currentSong) {
      logger.info("Queue: Re-adding current song for queue loop");
      return this.currentSong;
    }

    // Get next song from queue
    if (this.songs.length === 0) {
      logger.info("Queue: No more songs in queue");
      return null;
    }

    const nextSong = this.songs.shift();
    logger.info(`Queue: Next song is ${nextSong.title}`);
    return nextSong;
  }

  removeSong(index) {
    if (index < 0 || index >= this.songs.length) {
      return null;
    }
    return this.songs.splice(index, 1)[0];
  }

  clearQueue() {
    this.songs = [];
    this.currentSong = null;
  }

  shuffle() {
    for (let i = this.songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
    }
  }

  isEmpty() {
    return this.songs.length === 0;
  }

  getTotalDuration() {
    return this.songs.reduce((total, song) => total + (song.duration || 0), 0);
  }

  setLoop(mode) {
    this.loop = mode;
    logger.info(`Queue: Loop mode set to ${mode}`);
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(100, volume));
    if (this.resource && this.resource.volume) {
      this.resource.volume.setVolume(this.volume / 100);
    }
    logger.info(`Queue: Volume set to ${this.volume}%`);
  }
}

class QueueManager {
  constructor() {
    this.queues = new Map();
  }

  create(guildId, textChannel, voiceChannel) {
    const queue = new Queue(guildId, textChannel, voiceChannel);
    this.queues.set(guildId, queue);
    logger.info(`Queue created for guild ${guildId}`);
    return queue;
  }

  get(guildId) {
    return this.queues.get(guildId);
  }

  delete(guildId) {
    const queue = this.queues.get(guildId);
    if (queue) {
      // ✅ Safely destroy connection
      if (queue.connection) {
        try {
          // Check if connection is not already destroyed
          if (queue.connection.state.status !== "destroyed") {
            queue.connection.destroy();
            logger.info(`Connection destroyed for guild ${guildId}`);
          } else {
            logger.info(`Connection already destroyed for guild ${guildId}`);
          }
        } catch (error) {
          logger.warn(`Connection destroy error: ${error.message}`);
        }
        queue.connection = null; // Clear reference
      }

      // ✅ Safely stop player
      if (queue.player) {
        try {
          queue.player.stop(true); // Force stop
          logger.info(`Player stopped for guild ${guildId}`);
        } catch (error) {
          logger.warn(`Player stop error: ${error.message}`);
        }
        queue.player = null; // Clear reference
      }

      this.queues.delete(guildId);
      logger.info(`Queue deleted for guild ${guildId}`);
    }
  }

  has(guildId) {
    return this.queues.has(guildId);
  }
}

module.exports = new QueueManager();
