const { EmbedBuilder } = require('discord.js');

class CustomEmbedBuilder {
    static success(title, description) {
        return new EmbedBuilder()
            .setColor(0x00ff00) // Green
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static error(title, description) {
        return new EmbedBuilder()
            .setColor(0xff0000) // Red
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static info(title, description) {
        return new EmbedBuilder()
            .setColor(0x0099ff) // Blue
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    }

    static music(title, description) {
        return new EmbedBuilder()
            .setColor(0x9b59b6) // Purple
            .setTitle(`🎵 ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static warning(title, description) {
        return new EmbedBuilder()
            .setColor(0xffff00) // Yellow
            .setTitle(`⚠️ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }
}

module.exports = CustomEmbedBuilder;
