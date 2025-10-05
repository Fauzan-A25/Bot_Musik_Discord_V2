class Validators {
    static inVoiceChannel(member) {
        if (!member.voice.channel) {
            throw new Error('You need to be in a voice channel!');
        }
        return true;
    }

    static sameVoiceChannel(member, botMember) {
        if (botMember.voice.channel && member.voice.channel.id !== botMember.voice.channel.id) {
            throw new Error('You must be in the same voice channel as the bot!');
        }
        return true;
    }

    static hasVoicePermissions(channel, botMember) {
        // Check if channel is joinable (simple method)
        if (!channel.joinable) {
            throw new Error('I don\'t have permission to join the voice channel!');
        }
        
        // Check if bot can speak
        if (!channel.speakable) {
            throw new Error('I don\'t have permission to speak in the voice channel!');
        }
        
        return true;
    }

    static queueExists(queue) {
        if (!queue) {
            throw new Error('There is no active music player!');
        }
        return true;
    }

    static isPlaying(queue) {
        if (!queue || !queue.isPlaying) {
            throw new Error('There is no music playing right now!');
        }
        return true;
    }

    static queueNotEmpty(queue) {
        if (!queue || (queue.isEmpty() && !queue.currentSong)) {
            throw new Error('The queue is empty!');
        }
        return true;
    }

    static validateUrl(url) {
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        if (!ytRegex.test(url)) {
            throw new Error('Invalid YouTube URL!');
        }
        return true;
    }
}

module.exports = Validators;
