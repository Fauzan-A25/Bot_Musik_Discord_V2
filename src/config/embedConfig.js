const { EmbedBuilder } = require('discord.js');
const config = require('./botConfig');

class EmbedGenerator {
    static success(title, description) {
        return new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static error(title, description) {
        return new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static info(title, description) {
        return new EmbedBuilder()
            .setColor(config.embed.color)
            .setTitle(`ℹ️ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static music(title, description, thumbnail = null) {
        const embed = new EmbedBuilder()
            .setColor(config.embed.color)
            .setTitle(title)
            .setDescription(description)
            .setFooter({ text: config.embed.footer })
            .setTimestamp();
        
        if (thumbnail) embed.setThumbnail(thumbnail);
        
        return embed;
    }

    static queue(queue) {
        const tracks = queue.tracks.toArray();
        const currentTrack = queue.currentTrack;
        
        let description = `**Sedang Diputar:**\n${currentTrack.title} - ${currentTrack.author}\n\n`;
        
        if (tracks.length > 0) {
            description += '**Antrian Selanjutnya:**\n';
            tracks.slice(0, 10).forEach((track, i) => {
                description += `${i + 1}. ${track.title} - ${track.author}\n`;
            });
            
            if (tracks.length > 10) {
                description += `\n*Dan ${tracks.length - 10} lagu lainnya...*`;
            }
        }
        
        return new EmbedBuilder()
            .setColor(config.embed.color)
            .setTitle('🎵 Antrian Musik')
            .setDescription(description)
            .setFooter({ text: `Total ${tracks.length + 1} lagu` })
            .setTimestamp();
    }
}

module.exports = EmbedGenerator;
