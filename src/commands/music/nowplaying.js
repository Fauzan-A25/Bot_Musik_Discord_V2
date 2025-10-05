const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/botConfig');

module.exports = {
    name: 'nowplaying',
    description: 'Show the currently playing song',
    category: 'music',
    aliases: ['np'],
    cooldown: 3,
    
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the currently playing song'),

    async execute(interaction) {
        try {
            const guild = interaction.guild;
            const queue = QueueManager.get(guild.id);

            Validators.queueExists(queue);
            Validators.isPlaying(queue);

            const song = queue.currentSong;

            const embed = new EmbedBuilder()
                .setColor(colors.music)
                .setTitle(`${emojis.music} Now Playing`)
                .setDescription(`**[${song.title}](${song.url})**`)
                .addFields(
                    { name: '⏱️ Duration', value: song.durationFormatted, inline: true },
                    { name: '👤 Requested by', value: song.requestedBy.toString(), inline: true },
                    { name: '🔊 Volume', value: `${queue.volume}%`, inline: true }
                )
                .setTimestamp();

            if (song.thumbnail) {
                embed.setThumbnail(song.thumbnail);
            }

            if (song.author) {
                embed.addFields({ name: '📺 Channel', value: song.author, inline: true });
            }

            // Loop status
            const loopEmoji = queue.loop === 0 ? '➡️' : queue.loop === 1 ? '🔂' : '🔁';
            const loopText = queue.loop === 0 ? 'Off' : queue.loop === 1 ? 'Song' : 'Queue';
            embed.addFields({ name: `${loopEmoji} Loop`, value: loopText, inline: true });

            // Queue info
            if (queue.songs.length > 0) {
                embed.addFields({
                    name: '📜 Up Next',
                    value: queue.songs.slice(0, 3).map((s, i) => `${i + 1}. ${s.title}`).join('\n')
                });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            const embed = CustomEmbedBuilder.error('Error', error.message);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
