const fs = require('fs');
const path = require('path');
const colors = require('colors');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../events');
    const eventFolders = fs.readdirSync(eventsPath);

    let eventCount = 0;

    for (const folder of eventFolders) {
        const folderPath = path.join(eventsPath, folder);
        
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const eventFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(folderPath, file);
            
            try {
                const event = require(filePath);

                if (!event.name || !event.execute) {
                    console.log(`⚠️  Warning: ${file} is missing required properties.`.yellow);
                    continue;
                }

                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }

                eventCount++;
                console.log(`✅ Loaded event: ${event.name}`.green);

            } catch (error) {
                console.error(`❌ Error loading ${file}:`.red, error);
            }
        }
    }

    console.log(`\n✨ Successfully loaded ${eventCount} events!`.cyan);
};
