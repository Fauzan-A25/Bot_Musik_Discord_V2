const { SlashCommandBuilder } = require('discord.js');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');
const EmbedBuilder = require('../../utils/embedBuilder');

module.exports = {
    name: 'clear',
    description: 'Clear the music queue',
    category: 'music',
    cooldown: 3,
    
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear the music queue'),

    async execute(interaction) {
        try {
            const member = interaction.member;
            const guild = interaction.guild;

            // Validations
            Validators.inVoiceChannel(member);
            Validators.sameVoiceChannel(member, guild.members.me);
            
            const queue = QueueManager.get(guild.id);
            Validators.queueExists(queue);

            if (queue.isEmpty()) {
                throw new Error('The queue is already empty!');
            }

            const songCount = queue.songs.length;
            queue.clearQueue();

            const embed = EmbedBuilder.success(
                'Queue Cleared',
                `Cleared **${songCount}** songs from the queue`
            );

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            const embed = EmbedBuilder.error('Error', error.message);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
