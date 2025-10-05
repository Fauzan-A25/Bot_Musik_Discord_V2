const { SlashCommandBuilder } = require('discord.js');
const MusicPlayer = require('../../utils/musicPlayer');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');
const EmbedBuilder = require('../../utils/embedBuilder');
const { emojis } = require('../../config/botConfig');

module.exports = {
    name: 'skip',
    description: 'Skip the current song',
    category: 'music',
    cooldown: 2,
    
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),

    async execute(interaction) {
        try {
            const member = interaction.member;
            const guild = interaction.guild;

            // Validations
            Validators.inVoiceChannel(member);
            Validators.sameVoiceChannel(member, guild.members.me);
            
            const queue = QueueManager.get(guild.id);
            Validators.queueExists(queue);
            Validators.isPlaying(queue);

            const skippedSong = queue.currentSong;

            // Skip the song
            const skipped = MusicPlayer.skip(guild.id);

            if (skipped) {
                const embed = EmbedBuilder.success(
                    'Skipped',
                    `${emojis.skip} Skipped **${skippedSong.title}**`
                );
                
                if (queue.songs.length > 0) {
                    embed.addFields({
                        name: 'Up Next',
                        value: queue.songs[0].title
                    });
                }

                await interaction.reply({ embeds: [embed] });
            } else {
                throw new Error('Failed to skip the song');
            }

        } catch (error) {
            const embed = EmbedBuilder.error('Error', error.message);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
