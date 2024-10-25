const { InteractionType } = require('discord.js');

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (interaction.type === InteractionType.ApplicationCommand) { // Chat Input Command
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: `Something went wrong while executing this command...`,
                    ephemeral: true
                });
            }
        } else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command) return;
            try {
                await command.autocomplete(interaction, client);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.type === InteractionType.MessageComponent) { // Button Interaction
            const { buttons } = client;
            const { customId } = interaction;
            const button = buttons.get(customId);
            if (!button) return;

            try {
                await button.execute(interaction, client);
            } catch (error) {
                console.error(error);
            }
        }
    }
}
