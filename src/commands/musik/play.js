const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Memutar musik")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Isi dengan nama lagu atau URL yang ingin diputar")
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    await interaction.deferReply();
    const query = interaction.options.getString("query");
    const memberVC = interaction.member.voice.channel;
    const clientVC = interaction.guild.members.me.voice.channel;

    // Function to create and send embeds
    const sendEmbed = (description, color) => {
      const embed = new EmbedBuilder().setDescription(description).setColor(color);
      return interaction.editReply({ embeds: [embed] });
    };

    // Check if the user is in a voice channel
    if (!memberVC) {
      return sendEmbed("🚫 | Anda harus berada di voice channel untuk memutar musik!", "Red");
    }

    // Check if the bot is in a different voice channel
    if (clientVC && clientVC !== memberVC) {
      return sendEmbed("🚫 | Anda harus berada di channel yang sama dengan bot untuk memutar musik!", "Red");
    }

    // Function to attempt playing music
    const playMusic = async (attempt = 1, maxRetries = 2) => {
      try {
        await client.distube.play(memberVC, query, {
          member: interaction.member,
          textChannel: interaction.channel,
          interaction,
        });

        return sendEmbed(`🎶 | Sedang memutar: **${query}**`, "Green");
      } catch (error) {
        console.error(`Percobaan ${attempt} gagal:`, error);

        // If song can't be resolved, retry if not max attempt reached
        if (error.errorCode === "CANNOT_RESOLVE_SONG" && attempt < maxRetries) {
          return playMusic(attempt + 1);
        }

        // Send final error message if retries are exhausted or a different error occurred
        const errorMessage = attempt === maxRetries
          ? `🚫 | Lagu tidak ditemukan setelah ${maxRetries} kali percobaan. Coba gunakan judul atau URL yang berbeda.`
          : `🚫 | Terjadi kesalahan saat mencoba memutar musik: ${error.message}`;

        return sendEmbed(errorMessage, "Red");
      }
    };

    // Attempt to play music
    await playMusic();
  },
};
