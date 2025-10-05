const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { colors, emojis } = require('../../config/botConfig');

module.exports = {
    name: 'help',
    description: 'Display all available commands',
    category: 'utility',
    cooldown: 5,
    
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all available commands')
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('Get detailed info about a specific command')
                .setRequired(false)
        ),

    async execute(interaction) {
        const commandName = interaction.options.getString('command');

        if (commandName) {
            // Show specific command help
            return this.showCommandHelp(interaction, commandName);
        }

        // Show all commands categorized
        const client = interaction.client;
        const commands = client.commands;

        // Group commands by category
        const categories = new Map();
        
        commands.forEach(command => {
            if (!command.category) return;
            
            if (!categories.has(command.category)) {
                categories.set(command.category, []);
            }
            
            // Avoid duplicates (aliases)
            if (!categories.get(command.category).find(c => c.name === command.name)) {
                categories.get(command.category).push(command);
            }
        });

        const embed = new EmbedBuilder()
            .setColor(colors.info)
            .setTitle(`${emojis.music} Bot Commands`)
            .setDescription(`Use \`/help <command>\` for detailed information about a command.`)
            .setTimestamp()
            .setFooter({ text: `Total Commands: ${commands.size}` });

        // Add fields for each category
        categories.forEach((cmds, category) => {
            const categoryName = this.getCategoryEmoji(category) + ' ' + 
                                 category.charAt(0).toUpperCase() + category.slice(1);
            
            const commandList = cmds
                .map(cmd => `\`/${cmd.name}\` - ${cmd.description || 'No description'}`)
                .join('\n');

            embed.addFields({
                name: categoryName,
                value: commandList || 'No commands',
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed] });
    },

    showCommandHelp(interaction, commandName) {
        const client = interaction.client;
        const command = client.commands.get(commandName);

        if (!command) {
            const embed = new EmbedBuilder()
                .setColor(colors.error)
                .setTitle('❌ Command Not Found')
                .setDescription(`No command found with name \`${commandName}\``)
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(colors.info)
            .setTitle(`Command: /${command.name}`)
            .setDescription(command.description || 'No description provided')
            .setTimestamp();

        if (command.aliases && command.aliases.length > 0) {
            embed.addFields({
                name: '📝 Aliases',
                value: command.aliases.map(a => `\`${a}\``).join(', '),
                inline: false
            });
        }

        if (command.cooldown) {
            embed.addFields({
                name: '⏱️ Cooldown',
                value: `${command.cooldown} seconds`,
                inline: true
            });
        }

        if (command.category) {
            embed.addFields({
                name: '📁 Category',
                value: command.category.charAt(0).toUpperCase() + command.category.slice(1),
                inline: true
            });
        }

        return interaction.reply({ embeds: [embed] });
    },

    getCategoryEmoji(category) {
        const emojis = {
            music: '🎵',
            moderation: '🛡️',
            utility: '🔧'
        };
        return emojis[category] || '📌';
    }
};
