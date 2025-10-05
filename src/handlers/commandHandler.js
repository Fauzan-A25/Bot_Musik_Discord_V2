const fs = require('fs');
const path = require('path');
const colors = require('colors');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);

    let commandCount = 0;

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            
            try {
                const command = require(filePath);

                if (!command.name || !command.execute) {
                    console.log(`⚠️  Warning: ${file} is missing required properties.`.yellow);
                    continue;
                }

                command.category = folder;
                client.commands.set(command.name, command);
                
                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach(alias => {
                        client.commands.set(alias, command);
                    });
                }

                commandCount++;
                console.log(`✅ Loaded command: ${command.name}`.green);

            } catch (error) {
                console.error(`❌ Error loading ${file}:`.red, error);
            }
        }
    }

    console.log(`\n✨ Successfully loaded ${commandCount} commands!`.cyan);
};
