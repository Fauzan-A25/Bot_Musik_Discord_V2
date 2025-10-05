const { SlashCommandBuilder } = require('discord.js');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');
const EmbedBuilder = require('../../utils/embedBuilder');
const { emojis } = require('../../config/botConfig');

module.exports = {
    name: 'volume',
    description: 'Adjust the volume',
    category: 'music',
    cooldown: 2,
    
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Adjust the volume')
        .addIntegerOption(option =>
            option
                .setName('level')
                .setDescription('Volume level (0-200)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(200)
        ),

    async execute(interaction) {
        try {
            const member = interaction.member;
            const guild = interaction.guild;
            const volume = interaction.options.getInteger('level');

            // Validations
            Validators.inVoiceChannel(member);
            Validators.sameVoiceChannel(member, guild.members.me);
            
            const queue = QueueManager.get(guild.id);
            Validators.queueExists(queue);

            // Set volume
            queue.setVolume(volume);

            const volumeEmoji = volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊';
            const embed = EmbedBuilder.success(
                'Volume Adjusted',
                `${volumeEmoji} Volume set to **${volume}%**`
            );

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            const embed = EmbedBuilder.error('Error', error.message);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
