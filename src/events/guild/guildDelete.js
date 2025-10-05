const colors = require('colors');
const logger = require('../../utils/logger');
const QueueManager = require('../../utils/queueManager');

module.exports = {
    name: 'guildDelete',
    once: false,
    
    async execute(guild, client) {
        logger.warn(`Left guild: ${guild.name} (${guild.id})`);
        
        console.log(`\n${'='.repeat(50)}`.yellow);
        console.log(`👋 Left Server`.yellow);
        console.log(`   Name: ${guild.name}`.white);
        console.log(`   ID: ${guild.id}`.white);
        console.log(`   Members: ${guild.memberCount}`.white);
        console.log(`${'='.repeat(50)}\n`.yellow);

        // Clean up queue for this guild
        if (QueueManager.has(guild.id)) {
            QueueManager.delete(guild.id);
            logger.info(`Cleaned up queue for guild ${guild.id}`);
        }

        // Update bot presence
        client.user.setPresence({
            activities: [{
                name: `music in ${client.guilds.cache.size} servers`,
                type: 2
            }],
            status: 'online'
        });
    }
};
