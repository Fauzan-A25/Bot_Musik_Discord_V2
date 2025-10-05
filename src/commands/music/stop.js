const { SlashCommandBuilder } = require('discord.js');
const MusicPlayer = require('../../utils/musicPlayer');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');
const EmbedBuilder = require('../../utils/embedBuilder');
const { emojis } = require('../../config/botConfig');

module.exports = {
    name: 'stop',
    description: 'Stop the music and clear the queue',
    category: 'music',
    cooldown: 2,
    
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music and clear the queue'),

    async execute(interaction) {
        try {
            const member = interaction.member;
            const guild = interaction.guild;

            // Validations
            Validators.inVoiceChannel(member);
            Validators.sameVoiceChannel(member, guild.members.me);
            
            const queue = QueueManager.get(guild.id);
            Validators.queueExists(queue);

            // Stop the player
            const stopped = MusicPlayer.stop(guild.id);

            if (stopped) {
                const embed = EmbedBuilder.success(
                    'Stopped',
                    `${emojis.stop} Stopped the music and cleared the queue`
                );
                await interaction.reply({ embeds: [embed] });
            } else {
                throw new Error('Failed to stop the player');
            }

        } catch (error) {
            const embed = EmbedBuilder.error('Error', error.message);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
