const { EmbedBuilder } = require("discord.js");
const { createPlaySongEmbed } = require("../../utils/song.js");

module.exports = {
  data: {
    customId: "previous",
  },
  execute: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction.guildId);
    if (!queue) {
      return interaction.reply({
        content: `${client.emotes.error} | There is nothing in the queue right now!`,
        ephemeral: true,
      });
    }

    if (!queue.previousSongs.length) {
      return interaction.reply({
        content: `${client.emotes.error} | There is no previous song in the queue!`,
        ephemeral: true,
      });
    }

    try {
      await queue.previous();

      // Fetch the updated queue
      const updatedQueue = client.distube.getQueue(interaction.guildId);
      const song = updatedQueue.songs[0]; // Lagu yang sekarang diputar seharusnya adalah previousSong

      const oldMessages = await queue.textChannel.messages.fetch({ limit: 1 });
      const oldMessage = oldMessages.first();

      const { playSongEmbed, row } = createPlaySongEmbed(song, updatedQueue, client);

      oldMessage.edit({ embeds: [playSongEmbed], components: [row] })
      
      interaction.reply({ content: `${client.emotes.success} | Now playing the previous song!`, ephemeral: true });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: `${client.emotes.error} | There was an error trying to play the previous song: \`${error.message}\``,
        ephemeral: true,
      });
    }
  },
};
