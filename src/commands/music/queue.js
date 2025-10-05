const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');

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
                const embed = new EmbedBuilder()
                    .setColor(0xff9900)
                    .setTitle('📜 Queue is Empty')
                    .setDescription('There are no songs in the queue. Use `/play` to add some music!')
                    .setTimestamp();
                
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const page = interaction.options.getInteger('page') || 1;
            const songsPerPage = 5; // ✅ REDUCED from 10 to 5 untuk avoid limit
            const totalSongs = queue.songs.length;
            const totalPages = Math.ceil(totalSongs / songsPerPage) || 1;
            
            if (page > totalPages) {
                throw new Error(`Invalid page number! There are only ${totalPages} page(s).`);
            }

            const embed = new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle(`📜 Music Queue for ${guild.name}`)
                .setTimestamp();

            // Current song section
            if (queue.currentSong) {
                const currentSong = queue.currentSong;
                const title = this.truncateString(currentSong.title, 80); // ✅ Truncate long titles
                
                embed.addFields({
                    name: '🎵 Now Playing',
                    value: `**[${title}](${currentSong.url})**\n` +
                           `⏱️ \`${currentSong.durationFormatted || 'Unknown'}\` • ` +
                           `👤 ${currentSong.requestedBy}`,
                    inline: false
                });
            }

            // Queue songs section
            if (totalSongs > 0) {
                const start = (page - 1) * songsPerPage;
                const end = Math.min(start + songsPerPage, totalSongs);
                const songsOnPage = queue.songs.slice(start, end);

                // Build queue list with character limit check
                const queueLines = [];
                let currentLength = 0;
                
                for (let i = 0; i < songsOnPage.length; i++) {
                    const song = songsOnPage[i];
                    const position = start + i + 1;
                    const title = this.truncateString(song.title, 60); // ✅ Truncate to 60 chars
                    
                    const line = `\`${position}.\` **[${title}](${song.url})**\n` +
                                `└ ⏱️ \`${song.durationFormatted || '?:??'}\` • 👤 ${song.requestedBy}`;
                    
                    // Check if adding this line exceeds 1024 chars
                    if (currentLength + line.length + 2 > 1024) {
                        queueLines.push('\n*...and more*');
                        break;
                    }
                    
                    queueLines.push(line);
                    currentLength += line.length + 2; // +2 for \n\n
                }

                const queueList = queueLines.join('\n\n');

                embed.addFields({
                    name: `📜 Up Next (${totalSongs} song${totalSongs !== 1 ? 's' : ''})`,
                    value: queueList || '*No songs in queue*',
                    inline: false
                });
            } else {
                embed.addFields({
                    name: '📜 Up Next',
                    value: '*No songs in queue. The current song is the last one!*',
                    inline: false
                });
            }

            // Queue info section
            const totalDuration = this.getTotalDuration(queue);
            const loopStatus = this.getLoopStatus(queue.loop);
            
            embed.addFields(
                {
                    name: '🔁 Loop',
                    value: loopStatus,
                    inline: true
                },
                {
                    name: '🔊 Volume',
                    value: `${queue.volume}%`,
                    inline: true
                },
                {
                    name: '⏱️ Duration',
                    value: totalDuration,
                    inline: true
                }
            );

            // Footer with pagination
            if (totalPages > 1) {
                embed.setFooter({
                    text: `Page ${page}/${totalPages} • Use /queue page:<number> for more`
                });
            } else {
                embed.setFooter({
                    text: `Showing all ${totalSongs} song${totalSongs !== 1 ? 's' : ''}`
                });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Queue command error:', error);
            
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription(error.message || 'An error occurred while displaying the queue!')
                .setTimestamp();
            
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [embed] }).catch(console.error);
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            }
        }
    },

    // ✅ Helper: Truncate string to max length
    truncateString(str, maxLength) {
        if (!str) return 'Unknown';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    },

    getTotalDuration(queue) {
        try {
            let totalSeconds = 0;
            
            if (queue.currentSong && queue.currentSong.duration) {
                totalSeconds += queue.currentSong.duration;
            }
            
            if (queue.songs && queue.songs.length > 0) {
                totalSeconds += queue.songs.reduce((total, song) => {
                    return total + (song.duration || 0);
                }, 0);
            }

            if (totalSeconds === 0) return 'Unknown';

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            } else if (minutes > 0) {
                return `${minutes}m ${seconds}s`;
            } else {
                return `${seconds}s`;
            }
        } catch (error) {
            return 'Unknown';
        }
    },

    getLoopStatus(loopMode) {
        switch (loopMode) {
            case 0: return '➡️ Off';
            case 1: return '🔂 Song';
            case 2: return '🔁 Queue';
            default: return '➡️ Off';
        }
    }
};
