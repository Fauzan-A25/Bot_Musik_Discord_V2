const { EmbedBuilder } = require("discord.js");
const { createPlaySongEmbed } = require("../../utils/song");

module.exports = {
  data: {
    customId: "skip",
  },
  execute: async (client, interaction) => {
    const player = client.distube.getQueue(interaction.guild.id);
    const queue = client.distube.getQueue(interaction);
    if (!player) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription("Tidak ada lagu yang dapat dilewati."),
        ],
        ephemeral: true,
      });
    }
    const autoQueue = player.autoplay;
    if (!player.songs[1]) {
      const song = player.songs[0];
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(
              `Tidak ada lagu setelah [${song.name}](${song.url}) dalam antrian.`
            ),
        ],
        ephemeral: true,
      });
    }
    player.skip();
    const song = queue.songs[0];
    const oldMessages = await queue.textChannel.messages.fetch({ limit: 1 });
    const oldMessage = oldMessages.first();

    const { playSongEmbed, row } = createPlaySongEmbed(song, queue, client);

    oldMessage.edit({ embeds: [playSongEmbed], components: [row] });
    interaction.reply({ content: `${client.emotes.success} | Now playing the next song!`, ephemeral: true });
  },
};
