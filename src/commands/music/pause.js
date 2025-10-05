const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MusicPlayer = require('../../utils/musicPlayer');
const QueueManager = require('../../utils/queueManager');
const Validators = require('../../utils/validators');

module.exports = {
    name: 'pause',
    description: 'Pause the current song',
    category: 'music',
    cooldown: 2,
    
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),

    async execute(interaction) {
        try {
            const member = interaction.member;
            const guild = interaction.guild;

            Validators.inVoiceChannel(member);
            Validators.sameVoiceChannel(member, guild.members.me);
            
            const queue = QueueManager.get(guild.id);
            Validators.queueExists(queue);
            Validators.isPlaying(queue);

            MusicPlayer.pause(guild.id);

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Paused')
                .setDescription(`⏸️ Paused **${queue.currentSong.title}**`)
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
