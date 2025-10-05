const { SlashCommandBuilder } = require('discord.js');
const MusicPlayer = require('../../utils/musicPlayer');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');
const EmbedBuilder = require('../../utils/embedBuilder');
const { emojis } = require('../../config/botConfig');

module.exports = {
    name: 'resume',
    description: 'Resume the paused song',
    category: 'music',
    cooldown: 2,
    
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song'),

    async execute(interaction) {
        try {
            const member = interaction.member;
            const guild = interaction.guild;

            // Validations
            Validators.inVoiceChannel(member);
            Validators.sameVoiceChannel(member, guild.members.me);
            
            const queue = QueueManager.get(guild.id);
            Validators.queueExists(queue);

            // Resume the player
            const resumed = MusicPlayer.resume(guild.id);

            if (resumed) {
                const embed = EmbedBuilder.success(
                    'Resumed',
                    `${emojis.play} Resumed **${queue.currentSong.title}**`
                );
                await interaction.reply({ embeds: [embed] });
            } else {
                throw new Error('Failed to resume the player');
            }

        } catch (error) {
            const embed = EmbedBuilder.error('Error', error.message);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
