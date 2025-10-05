require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    prefix: process.env.PREFIX || '!',
    ownerId: process.env.OWNER_ID || '',
    
    // Music settings
    music: {
        maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE) || 100,
        defaultVolume: parseInt(process.env.DEFAULT_VOLUME) || 50,
        maxVolume: 200,
        disconnectTime: 300000, // 5 minutes in ms
        leaveOnEmpty: true,
        leaveOnEnd: true,
        leaveOnStop: true
    },
    
    // Embed colors (HEX format)
    colors: {
        success: 0x00ff00,  // Green
        error: 0xff0000,    // Red
        info: 0x0099ff,     // Blue
        warning: 0xffff00,  // Yellow
        music: 0x9b59b6     // Purple
    },
    
    // Emojis
    emojis: {
        play: '▶️',
        pause: '⏸️',
        stop: '⏹️',
        skip: '⏭️',
        previous: '⏮️',
        queue: '📜',
        volume: '🔊',
        loop: '🔁',
        shuffle: '🔀',
        success: '✅',
        error: '❌',
        loading: '⏳',
        music: '🎵'
    }
};
