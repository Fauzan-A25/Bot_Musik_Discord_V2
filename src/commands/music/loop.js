const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');
const { LOOP_MODES } = require('../../config/constants');

module.exports = {
    name: 'loop',
    description: 'Toggle loop mode',
    category: 'music',
    cooldown: 2,
    
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggle loop mode')
        .addStringOption(option =>
            option
                .setName('mode')
                .setDescription('Loop mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Song', value: 'song' },
                    { name: 'Queue', value: 'queue' }
                )
        ),

    async execute(interaction) {
        try {
            const member = interaction.member;
            const guild = interaction.guild;
            const mode = interaction.options.getString('mode');

            // Validations
            Validators.inVoiceChannel(member);
            Validators.sameVoiceChannel(member, guild.members.me);
            
            const queue = QueueManager.get(guild.id);
            Validators.queueExists(queue);

            // Set loop mode
            let loopMode;
            let loopText;
            let loopEmoji;

            switch (mode) {
                case 'off':
                    loopMode = LOOP_MODES.NONE;
                    loopText = 'disabled';
                    loopEmoji = '➡️';
                    break;
                case 'song':
                    loopMode = LOOP_MODES.SONG;
                    loopText = 'enabled for **current song**';
                    loopEmoji = '🔂';
                    break;
                case 'queue':
                    loopMode = LOOP_MODES.QUEUE;
                    loopText = 'enabled for **entire queue**';
                    loopEmoji = '🔁';
                    break;
            }

            queue.setLoop(loopMode);

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Loop Mode Changed')
                .setDescription(`${loopEmoji} Loop ${loopText}`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription(error.message)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
