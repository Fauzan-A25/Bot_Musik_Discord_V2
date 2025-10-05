const play = require('play-dl');
const logger = require('../utils/logger');

class YouTubeService {
    constructor() {
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            try {
                await play.getFreeClientID();
                this.initialized = true;
                logger.success('YouTube service initialized with play-dl');
            } catch (error) {
                logger.warn('YouTube service initialization warning: ' + error.message);
                this.initialized = true;
            }
        }
    }

    async search(query, limit = 1) {
        try {
            const results = await play.search(query, { 
                limit, 
                source: { youtube: 'video' } 
            });
            
            if (!results || results.length === 0) {
                throw new Error('No results found');
            }

            return results.map(video => ({
                title: video.title || 'Unknown Title',
                url: video.url,
                duration: video.durationInSec || 0,
                durationFormatted: this.formatDuration(video.durationInSec || 0),
                thumbnail: video.thumbnails?.[0]?.url || null,
                author: video.channel?.name || 'Unknown',
                views: video.views || 0
            }));
        } catch (error) {
            logger.error(`Search error: ${error.message}`);
            throw new Error(`Failed to search YouTube: ${error.message}`);
        }
    }

    async getVideoInfo(url) {
        try {
            const info = await play.video_info(url);
            const details = info.video_details;

            return {
                title: details.title || 'Unknown Title',
                url: details.url,
                duration: details.durationInSec || 0,
                durationFormatted: this.formatDuration(details.durationInSec || 0),
                thumbnail: details.thumbnails?.[0]?.url || null,
                author: details.channel?.name || 'Unknown',
                views: details.views || 0
            };
        } catch (error) {
            logger.error(`Get video info error: ${error.message}`);
            throw new Error(`Failed to get video info: ${error.message}`);
        }
    }

    async getPlaylist(url) {
        try {
            const playlist = await play.playlist_info(url, { incomplete: true });
            const videos = await playlist.all_videos();

            return {
                title: playlist.title || 'Unknown Playlist',
                url: playlist.url,
                videoCount: playlist.videoCount || videos.length,
                videos: videos.slice(0, 50).map(video => ({
                    title: video.title || 'Unknown Title',
                    url: video.url,
                    duration: video.durationInSec || 0,
                    durationFormatted: this.formatDuration(video.durationInSec || 0),
                    thumbnail: video.thumbnails?.[0]?.url || null,
                    author: video.channel?.name || 'Unknown'
                }))
            };
        } catch (error) {
            logger.error(`Get playlist error: ${error.message}`);
            throw new Error(`Failed to get playlist: ${error.message}`);
        }
    }

    validateUrl(url) {
        try {
            const validation = play.yt_validate(url);
            return validation; // Returns 'video', 'playlist', or false
        } catch (error) {
            return false;
        }
    }

    formatDuration(seconds) {
        if (!seconds || seconds === 0) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    isYouTubeUrl(string) {
        return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(string);
    }
}

module.exports = new YouTubeService();
