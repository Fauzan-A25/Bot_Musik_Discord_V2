const { InteractionType } = require('discord.js');
const ErrorHandler = require('../../handlers/errorHandler');

module.exports = {
    name: 'interactionCreate',
    
    async execute(interaction, client) {
        // Handle slash commands
        if (interaction.type === InteractionType.ApplicationCommand) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            // Check cooldowns
            if (!client.cooldowns.has(command.name)) {
                client.cooldowns.set(command.name, new Map());
            }

            const now = Date.now();
            const timestamps = client.cooldowns.get(command.name);
            const cooldownAmount = (command.cooldown || 3) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return interaction.reply({
                        content: `⏳ Please wait ${timeLeft.toFixed(1)} seconds before using \`${command.name}\` again.`,
                        ephemeral: true
                    });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            // Execute command
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                ErrorHandler.handle(error, interaction);
            }
        }
    }
};
