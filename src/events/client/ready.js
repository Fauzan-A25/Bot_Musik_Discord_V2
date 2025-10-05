const colors = require('colors');

module.exports = {
    name: 'ready', // Keep as 'ready' for discord.js v14
    once: true,
    
    async execute(client) {
        console.log('\n╔════════════════════════════════════════╗'.cyan);
        console.log(`║  Bot is online and ready! `.cyan);
        console.log(`║  Logged in as: ${client.user.tag}`.green);
        console.log(`║  Servers: ${client.guilds.cache.size}`.yellow);
        console.log(`║  Users: ${client.users.cache.size}`.yellow);
        console.log('╚════════════════════════════════════════╝\n'.cyan);

        // Set bot activity
        client.user.setPresence({
            activities: [{
                name: `music in ${client.guilds.cache.size} servers`,
                type: 2 // LISTENING
            }],
            status: 'online'
        });

        // Update activity every 5 minutes
        setInterval(() => {
            const activities = [
                { name: `music in ${client.guilds.cache.size} servers`, type: 2 },
                { name: `/help for commands`, type: 3 },
                { name: `${client.users.cache.size} users`, type: 3 }
            ];

            const activity = activities[Math.floor(Math.random() * activities.length)];
            client.user.setPresence({
                activities: [activity],
                status: 'online'
            });
        }, 300000);
    }
};
