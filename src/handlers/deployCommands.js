require('dotenv').config(); // ✅ LOAD ENV FIRST!

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const colors = require('colors');

// ✅ Read directly from environment variables
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

// ✅ Validate
if (!token || !clientId) {
    console.error('❌ Error: DISCORD_TOKEN or CLIENT_ID not found in .env file!'.red);
    console.log('Please check your .env file and make sure it contains:'.yellow);
    console.log('  DISCORD_TOKEN=your_token_here');
    console.log('  CLIENT_ID=your_client_id_here');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(commandsPath);

console.log('🔄 Loading commands...'.cyan);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (command.data) {
            commands.push(command.data.toJSON());
            console.log(`✅ Loaded: ${command.data.name}`.green);
        } else {
            console.log(`⚠️  Warning: ${file} is missing 'data' property`.yellow);
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`\n🚀 Started refreshing ${commands.length} application (/) commands.`.cyan);

        // Deploy commands globally
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands globally!`.green);
        
        console.log('\n📋 Deployed commands:'.cyan);
        data.forEach(cmd => {
            console.log(`   - /${cmd.name}`.white);
        });

    } catch (error) {
        console.error('❌ Error deploying commands:'.red, error);
    }
})();
