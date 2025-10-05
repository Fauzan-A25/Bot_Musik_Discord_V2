const { LOOP_MODES } = require('../config/constants');

class Queue {
    constructor(guildId, textChannel, voiceChannel) {
        this.guildId = guildId;
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.connection = null;
        this.player = null;
        this.songs = [];
        this.volume = 50;
        this.loop = LOOP_MODES.NONE; // ✅ Sekarang akan work!
        this.isPlaying = false;
        this.currentSong = null;
        this.resource = null;
    }

    addSong(song) {
        this.songs.push(song);
    }

    addSongs(songs) {
        this.songs.push(...songs);
    }

    removeSong(index) {
        if (index >= 0 && index < this.songs.length) {
            return this.songs.splice(index, 1)[0];
        }
        return null;
    }

    clearQueue() {
        this.songs = [];
    }

    shuffle() {
        for (let i = this.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
        }
    }

    getNextSong() {
        if (this.loop === LOOP_MODES.SONG) {
            return this.currentSong;
        }

        if (this.songs.length === 0) {
            return null;
        }

        const nextSong = this.songs.shift();

        if (this.loop === LOOP_MODES.QUEUE && this.currentSong) {
            this.songs.push(this.currentSong);
        }

        return nextSong;
    }

    getTotalDuration() {
        return this.songs.reduce((total, song) => total + (song.duration || 0), 0);
    }

    isEmpty() {
        return this.songs.length === 0;
    }

    setLoop(mode) {
        this.loop = mode;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(200, volume));
        if (this.resource && this.resource.volume) {
            this.resource.volume.setVolume(this.volume / 100);
        }
    }
}

class QueueManager {
    constructor() {
        this.queues = new Map();
    }

    create(guildId, textChannel, voiceChannel) {
        const queue = new Queue(guildId, textChannel, voiceChannel);
        this.queues.set(guildId, queue);
        return queue;
    }

    get(guildId) {
        return this.queues.get(guildId);
    }

    delete(guildId) {
        const queue = this.queues.get(guildId);
        if (queue) {
            if (queue.connection) {
                queue.connection.destroy();
            }
            if (queue.player) {
                queue.player.stop();
            }
            this.queues.delete(guildId);
        }
    }

    has(guildId) {
        return this.queues.has(guildId);
    }

    clear() {
        this.queues.forEach((queue) => {
            if (queue.connection) queue.connection.destroy();
            if (queue.player) queue.player.stop();
        });
        this.queues.clear();
    }
}

module.exports = new QueueManager();
