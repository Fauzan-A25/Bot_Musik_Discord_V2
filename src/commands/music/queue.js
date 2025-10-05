const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/botConfig');

module.exports = {
    name: 'queue',
    description: 'Show the music queue',
    category: 'music',
    cooldown: 3,
    
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the music queue')
        .addIntegerOption(option =>
            option
                .setName('page')
                .setDescription('Page number')
                .setRequired(false)
                .setMinValue(1)
        ),

    async execute(interaction) {
        try {
            const guild = interaction.guild;
            const queue = QueueManager.get(guild.id);

            Validators.queueExists(queue);

            if (!queue.currentSong && queue.isEmpty()) {
                throw new Error('The queue is empty!');
            }

            const page = interaction.options.getInteger('page') || 1;
            const songsPerPage = 10;
            const totalPages = Math.ceil(queue.songs.length / songsPerPage);
            
            if (page > totalPages && totalPages > 0) {
                throw new Error(`Invalid page number! Max pages: ${totalPages}`);
            }

            const embed = new EmbedBuilder()
                .setColor(colors.music)
                .setTitle(`${emojis.queue} Music Queue for ${guild.name}`)
                .setTimestamp();

            // Current song
            if (queue.currentSong) {
                embed.addFields({
                    name: '🎵 Now Playing',
                    value: `**[${queue.currentSong.title}](${queue.currentSong.url})**\n` +
                           `Duration: \`${queue.currentSong.durationFormatted}\` | ` +
                           `Requested by: ${queue.currentSong.requestedBy}`,
                    inline: false
                });
            }

            // Queue songs
            if (queue.songs.length > 0) {
                const start = (page - 1) * songsPerPage;
                const end = start + songsPerPage;
                const songs = queue.songs.slice(start, end);

                const queueList = songs.map((song, index) => {
                    const position = start + index + 1;
                    return `\`${position}.\` [${song.title}](${song.url})\n` +
                           `└ \`${song.durationFormatted}\` | ${song.requestedBy}`;
                }).join('\n\n');

                embed.addFields({
                    name: `📜 Up Next (${queue.songs.length} songs)`,
                    value: queueList || 'No songs in queue',
                    inline: false
                });

                // Pagination info
                if (totalPages > 1) {
                    embed.setFooter({
                        text: `Page ${page}/${totalPages} | Total Duration: ${this.getTotalDuration(queue)}`
                    });
                } else {
                    embed.setFooter({
                        text: `Total Duration: ${this.getTotalDuration(queue)}`
                    });
                }
            } else {
                embed.addFields({
                    name: '📜 Up Next',
                    value: 'No songs in queue',
                    inline: false
                });
            }

            // Loop status
            const loopStatus = queue.loop === 0 ? 'Off' : queue.loop === 1 ? 'Song' : 'Queue';
            embed.addFields({
                name: '🔁 Loop',
                value: loopStatus,
                inline: true
            }, {
                name: '🔊 Volume',
                value: `${queue.volume}%`,
                inline: true
            });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            const embed = CustomEmbedBuilder.error('Error', error.message);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },

    getTotalDuration(queue) {
        let totalSeconds = 0;
        
        if (queue.currentSong) {
            totalSeconds += queue.currentSong.duration || 0;
        }
        
        totalSeconds += queue.getTotalDuration();

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        }
        return `${minutes}m ${seconds}s`;
    }
};
