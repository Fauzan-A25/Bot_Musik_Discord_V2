const { DisTube } = require("distube");
const {
  Collection,
  Client,
  Partials,
  GatewayIntentBits,
  EmbedBuilder,
  TextChannel,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: './src/.env' });
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { createPlaySongEmbed } = require("./utils/song");
const ffmpegPath = require("ffmpeg-static");

client.config = {
  token: process.env.TOKEN,
  emoji: {
    play: process.env.EMOJI_PLAY,
    stop: process.env.EMOJI_STOP,
    queue: process.env.EMOJI_QUEUE,
    success: process.env.EMOJI_SUCCESS,
    repeat: process.env.EMOJI_REPEAT,
    error: process.env.EMOJI_ERROR,
  },
};

const distube = new DisTube(client, {
  ffmpeg: {
    path: ffmpegPath,
  },
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  plugins: [new SpotifyPlugin(), new SoundCloudPlugin(), new YtDlpPlugin()],
});

client.commandArray = [];
client.commands = new Collection();
client.aliases = new Collection();
client.emotes = client.config.emoji;
client.distube = distube;
client.buttons = new Map();
client.queue = new Map();

function importCommands(dir) {
  const commands = {};
  fs.readdirSync(dir).forEach((file) => {
    if (file.endsWith(".js")) {
      const commandName = path.basename(file, ".js");
      commands[commandName] = require(path.join(dir, file));
    }
  });
  return commands;
}

const commands = importCommands(path.join(__dirname, "./components/buttons"));

for (const [name, command] of Object.entries(commands)) {
  client.buttons.set(command.data.customId, command);
  console.log(`Button loaded: ${command.data.customId}`);
}


client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  const prefix = config.prefix;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const cmd =
    client.commands.get(command) ||
    client.commands.get(client.aliases.get(command));
  if (!cmd) return;
  if (cmd.inVoiceChannel && !message.member.voice.channel) {
    return message.channel.send(
      `${client.emotes.error} | You must be in a voice channel!`
    );
  }
  try {
    cmd.run(client, message, args);
  } catch (e) {
    console.error(e);
    message.channel.send(`${client.emotes.error} | Error: \`${e}\``);
  }
});

const notificationAlert = (queue, embeds = [], components = []) => {
  queue.textChannel.send({ embeds, components });
};

const errorsHandling = (channel, e) => {
  const errorMessage = `${client.emotes.error} | An error encountered: ${e
    .toString()
    .slice(0, 1974)}`;
  if (channel instanceof TextChannel) {
    channel.send(errorMessage);
  } else {
    console.error(e);
  }
};

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId } = interaction;

  // Optimalkan dengan mengambil dari client.buttons
  const button = client.buttons.get(customId);

  if (button && button.execute) {
    try {
      await button.execute(client, interaction); // Eksekusi tombol dari client.buttons
    } catch (error) {
      console.error(
        `Error executing button with custom ID: ${customId}`,
        error
      );

      await interaction.reply({
        content: `There was an error executing the button: ${error.message}`,
        ephemeral: true,
      });
    }
  } else {
    console.error(`No button found for custom ID: ${customId}`);
    await interaction.reply({
      content: `Button not found for ID: ${customId}`,
      ephemeral: true,
    });
  }
});

client.distube
  .on("playSong", async (queue, song) => {
    try {
      console.log("Playing song:", song.name);
      const oldMessages = await queue.textChannel.messages.fetch({ limit: 1 });
      const oldMessage = oldMessages.first();
      const { playSongEmbed, row } = createPlaySongEmbed(song, queue, client);
      if (oldMessage) {
        await oldMessage.edit({ embeds: [playSongEmbed], components: [row] });
      } else {
        notificationAlert(queue, [playSongEmbed], [row]);
      }
    } catch (e) {
      errorsHandling(queue, e);
    }
  })
  .on("addSong", (queue, song) => {
    console.log("Added song:", song.name);
    const addSongEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setDescription(
        `${client.emotes.success} | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
      )
      .setTimestamp();
    notificationAlert(queue, [addSongEmbed]);
  })
  .on("addList", (queue, playlist) => {
    console.log("Added playlist:", playlist.name);
    const addListEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setDescription(
        `${client.emotes.success} | Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue`
      )
      .setTimestamp();
    notificationAlert(queue, [addListEmbed]);
  })
  .on("error", (channel, e) => errorsHandling(channel, e))
  .on("empty", (channel) => {
    console.log("Voice channel is empty");
    const emptyEmbed = new EmbedBuilder()
      .setColor("#ff0000")
      .setDescription("Voice channel is empty! Leaving the channel...")
      .setTimestamp();
    notificationAlert(channel, [emptyEmbed]);
  })
  .on("searchNoResult", (message, query) => {
    console.log("No search results for:", query);
    const noResultEmbed = new EmbedBuilder()
      .setColor("#ff0000")
      .setDescription(
        `${client.emotes.error} | No result found for \`${query}\`!`
      )
      .setTimestamp();
    notificationAlert(message.channel, [noResultEmbed]);
  })
  .on("finish", async (queue) => {
    try {
      console.log("Queue finished");

      // Fetch the latest message
      const oldMessages = await queue.textChannel.messages.fetch({ limit: 1 });
      const oldMessage = oldMessages.first();

      // Delete the previous message if any
      if (oldMessage) {
        await oldMessage.delete();
      }

      // Send new "Finished" message
      const finishEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setDescription("Queue finished! Leaving the voice channel...")
        .setTimestamp();
      await notificationAlert(queue, [finishEmbed]);

      // Ensure the bot leaves the voice channel
      const connection = client.voice.connections.find(
        (conn) => conn.channel.id === queue.voiceChannel.id
      );
      if (connection) {
        connection.destroy();
      }
    } catch (e) {
      errorsHandling(queue.textChannel, e);
    }
  });

const functionfolders = fs.readdirSync(`./src/functions`);
for (const folder of functionfolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();
client.login(process.env.TOKEN);
