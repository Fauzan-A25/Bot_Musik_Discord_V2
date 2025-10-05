module.exports = {
    // Loop modes - TAMBAHKAN INI! ✅
    LOOP_MODES: {
        NONE: 0,
        SONG: 1,
        QUEUE: 2
    },
    
    emojis: {
        play: '▶️',
        pause: '⏸️',
        stop: '⏹️',
        skip: '⏭️',
        previous: '⏮️',
        shuffle: '🔀',
        loop: '🔁',
        volume: '🔊',
        queue: '📜',
        success: '✅',
        error: '❌',
        loading: '⏳',
        music: '🎵',
        note: '🎶'
    },
    
    colors: {
        success: '#00FF00',
        error: '#FF0000',
        warning: '#FFA500',
        info: '#0099FF',
        music: '#9B59B6'
    },
    
    limits: {
        maxQueueSize: 100,
        maxSongDuration: 3600, // 1 hour in seconds
        maxPlaylistSize: 50
    },
    
    cooldowns: {
        default: 3, // seconds
        music: 5
    },
    
    messages: {
        noPermission: 'Kamu tidak memiliki izin untuk menggunakan command ini!',
        notInVoiceChannel: 'Kamu harus berada di voice channel!',
        notInSameChannel: 'Kamu harus berada di voice channel yang sama dengan bot!',
        noQueue: 'Tidak ada musik yang sedang diputar!',
        noSongPlaying: 'Tidak ada lagu yang sedang diputar!',
        invalidUrl: 'URL tidak valid! Gunakan link YouTube, Spotify, atau SoundCloud.',
        queueEmpty: 'Antrian musik kosong!'
    }
};
