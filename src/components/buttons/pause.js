module.exports = {
  data: {
    customId: "pause",
  },
  execute: async (client, interaction) => {
    const queue = distube.getQueue(interaction.guildId);

    if (!queue) {
      return await interaction.reply({
        content: "There is no song playing right now!",
        ephemeral: true,
      });
    }

    if (queue.paused) {
      queue.resume();
      await interaction.reply({
        content: "Resumed the song!",
        ephemeral: true,
      });
    } else {
      queue.pause();
      await interaction.reply({
        content: "Paused the song!",
        ephemeral: true,
      });
    }
  },
};
