const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../config/botConfig');

module.exports = {
    name: 'ping',
    description: 'Check bot latency',
    category: 'utility',
    cooldown: 3,
    
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),

    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: '🏓 Pinging...', 
            fetchReply: true 
        });

        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(colors.info)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '📡 Bot Latency', value: `\`${latency}ms\``, inline: true },
                { name: '💓 API Latency', value: `\`${apiLatency}ms\``, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    }
};
