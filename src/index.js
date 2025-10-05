const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config/botConfig');
const colors = require('colors');
require('dotenv').config();

// Create Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

// Collections for commands and cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();
client.queues = new Collection();

// Load handlers
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');

// Initialize handlers
commandHandler(client);
eventHandler(client);

// Global error handlers
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Promise Rejection:'.red, error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:'.red, error);
});

// Login to Discord
client.login(token).catch((error) => {
    console.error('❌ Failed to login:'.red, error);
    process.exit(1);
});

module.exports = client;
