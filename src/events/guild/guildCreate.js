const colors = require('colors');
const logger = require('../../utils/logger');

module.exports = {
    name: 'guildCreate',
    once: false,
    
    async execute(guild, client) {
        logger.success(`Joined new guild: ${guild.name} (${guild.id})`);
        
        console.log(`\n${'='.repeat(50)}`.cyan);
        console.log(`🎉 Joined New Server!`.green);
        console.log(`   Name: ${guild.name}`.white);
        console.log(`   ID: ${guild.id}`.white);
        console.log(`   Members: ${guild.memberCount}`.white);
        console.log(`   Owner: ${(await guild.fetchOwner()).user.tag}`.white);
        console.log(`${'='.repeat(50)}\n`.cyan);

        // Update bot presence
        client.user.setPresence({
            activities: [{
                name: `music in ${client.guilds.cache.size} servers`,
                type: 2
            }],
            status: 'online'
        });

        // Send welcome message to system channel
        if (guild.systemChannel && guild.systemChannel.permissionsFor(client.user).has('SendMessages')) {
            const welcomeMessage = `👋 Thanks for adding me to **${guild.name}**!\n\n` +
                                  `🎵 I'm a music bot that can play songs from YouTube.\n` +
                                  `📝 Use \`/help\` to see all available commands.\n` +
                                  `🎶 Get started with \`/play <song name>\`\n\n` +
                                  `Need support? Join our support server!`;
            
            guild.systemChannel.send(welcomeMessage).catch(console.error);
        }
    }
};
