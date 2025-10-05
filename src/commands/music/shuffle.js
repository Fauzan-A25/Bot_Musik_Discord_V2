const { SlashCommandBuilder } = require('discord.js');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');
const EmbedBuilder = require('../../utils/embedBuilder');
const { emojis } = require('../../config/botConfig');

module.exports = {
    name: 'shuffle',
    description: 'Shuffle the queue',
    category: 'music',
    cooldown: 3,
    
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the queue'),

    async execute(interaction) {
        try {
            const member = interaction.member;
            const guild = interaction.guild;

            // Validations
            Validators.inVoiceChannel(member);
            Validators.sameVoiceChannel(member, guild.members.me);
            
            const queue = QueueManager.get(guild.id);
            Validators.queueExists(queue);

            if (queue.songs.length < 2) {
                throw new Error('Not enough songs in the queue to shuffle! Need at least 2 songs.');
            }

            // Shuffle the queue
            queue.shuffle();

            const embed = EmbedBuilder.success(
                'Queue Shuffled',
                `${emojis.shuffle} Successfully shuffled **${queue.songs.length}** songs in the queue`
            );

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            const embed = EmbedBuilder.error('Error', error.message);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
