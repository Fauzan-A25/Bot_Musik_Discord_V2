const { SlashCommandBuilder } = require('discord.js');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');
const EmbedBuilder = require('../../utils/embedBuilder');

module.exports = {
    name: 'remove',
    description: 'Remove a song from the queue',
    category: 'music',
    cooldown: 2,
    
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from the queue')
        .addIntegerOption(option =>
            option
                .setName('position')
                .setDescription('Position of the song in queue')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction) {
        try {
            const member = interaction.member;
            const guild = interaction.guild;
            const position = interaction.options.getInteger('position');

            // Validations
            Validators.inVoiceChannel(member);
            Validators.sameVoiceChannel(member, guild.members.me);
            
            const queue = QueueManager.get(guild.id);
            Validators.queueExists(queue);

            if (queue.isEmpty()) {
                throw new Error('The queue is empty!');
            }

            if (position > queue.songs.length) {
                throw new Error(`Invalid position! The queue only has ${queue.songs.length} songs.`);
            }

            // Remove the song
            const removedSong = queue.removeSong(position - 1);

            const embed = EmbedBuilder.success(
                'Song Removed',
                `Removed **${removedSong.title}** from position #${position}`
            );

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            const embed = EmbedBuilder.error('Error', error.message);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
