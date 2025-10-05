const { EmbedBuilder } = require('discord.js');
const { colors } = require('../config/botConfig');

class ErrorHandler {
    static handle(error, interaction = null) {
        console.error('Error occurred:', error);

        const errorEmbed = new EmbedBuilder()
            .setColor(colors.error)
            .setTitle('❌ An Error Occurred')
            .setDescription(this.getErrorMessage(error))
            .setTimestamp();

        if (interaction) {
            const replyMethod = interaction.replied || interaction.deferred 
                ? 'editReply' 
                : 'reply';

            interaction[replyMethod]({ 
                embeds: [errorEmbed], 
                ephemeral: true 
            }).catch(console.error);
        }

        return errorEmbed;
    }

    static getErrorMessage(error) {
        // Check if error has a message property
        if (error.message) {
            return error.message;
        }

        // Check for specific error codes
        const errorMessages = {
            'VOICE_MISSING_PERMS': 'I don\'t have permission to join or speak in the voice channel!',
            'VOICE_CONNECTION_TIMEOUT': 'Voice connection timed out. Please try again.',
            'NO_VOICE_CHANNEL': 'You need to be in a voice channel!',
            'DIFFERENT_VOICE_CHANNEL': 'You must be in the same voice channel as the bot!',
            'NO_PLAYER': 'There is no active music player!',
            'QUEUE_EMPTY': 'The queue is empty!',
            'VIDEO_UNAVAILABLE': 'This video is unavailable or restricted!',
            'NO_RESULTS': 'No results found for your search!',
            'INVALID_URL': 'Invalid URL provided!',
            'PLAYLIST_LOAD_FAILED': 'Failed to load playlist!',
            'AGE_RESTRICTED': 'This video is age-restricted and cannot be played!',
        };

        return errorMessages[error.code] || 'An unexpected error occurred!';
    }

    static voiceError(message) {
        return new Error(message);
    }

    static playerError(message) {
        return new Error(message);
    }
}

module.exports = ErrorHandler;
