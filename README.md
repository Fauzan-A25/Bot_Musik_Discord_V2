# 🎵 Discord Music Bot

A feature-rich Discord music bot built with Node.js and discord.js v14. Stream high-quality music from YouTube directly to your Discord server with advanced features like loop modes, queue management, and more.

[![Discord.js](https://img.shields.io/badge/discord.js-v14.16.3-blue.svg)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/node.js-v16%2B-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ Features

- 🎵 **High-Quality Audio Streaming** - Stream music from YouTube using yt-dlp
- 🔊 **Volume Control** - Adjust volume from 0-100%
- 🔁 **Loop Modes** - Loop single song or entire queue
- 📜 **Queue Management** - View, shuffle, and manage your music queue
- ⏸️ **Playback Controls** - Play, pause, resume, skip, and stop
- 🎲 **Shuffle** - Randomize your queue
- 🔍 **Search** - Search YouTube directly from Discord
- 📊 **Now Playing** - Beautiful embeds showing current song info
- ⏱️ **Auto-Disconnect** - Automatically leaves voice channel when inactive
- 🛡️ **Error Handling** - Robust error handling and recovery

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) v16.11.0 or higher
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [FFmpeg](https://ffmpeg.org/download.html)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (for YouTube streaming)

### Installing FFmpeg

#### Windows
```


# Using Chocolatey

choco install ffmpeg

# Or using winget

winget install ffmpeg

```

#### Linux (Ubuntu/Debian)
```

sudo apt update
sudo apt install ffmpeg

```

#### macOS
```

brew install ffmpeg

```

### Installing yt-dlp

```


# Using npm (recommended)

npm install -g yt-dlp

# Or using pip

pip install yt-dlp

# Or using winget (Windows)

winget install yt-dlp.yt-dlp

```

## 🚀 Installation

### 1. Clone the Repository

```

git clone https://github.com/yourusername/discord-music-bot.git
cd discord-music-bot

```

### 2. Install Dependencies

```

npm install

```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```


# Discord Bot Configuration

DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_test_server_id_here (optional, for development)

# Node Environment

NODE_ENV=production

```

**How to get Discord Token:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing one
3. Go to "Bot" section
4. Click "Reset Token" and copy the token
5. Paste it in `.env` file

### 4. Deploy Slash Commands

```

npm run deploy

```

### 5. Start the Bot

```


# Production

npm start

# Development (with nodemon)

npm run dev

```

## 🎮 Commands

### Music Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/play` | Play a song from YouTube | `/play query:song name` or `/play query:youtube_url` |
| `/pause` | Pause the current song | `/pause` |
| `/resume` | Resume the paused song | `/resume` |
| `/skip` | Skip the current song | `/skip` |
| `/stop` | Stop playback and clear queue | `/stop` |
| `/queue` | Show the current queue | `/queue` or `/queue page:2` |
| `/nowplaying` | Show currently playing song | `/nowplaying` |
| `/loop` | Set loop mode | `/loop mode:off/song/queue` |
| `/shuffle` | Shuffle the queue | `/shuffle` |
| `/volume` | Change volume | `/volume level:50` |
| `/remove` | Remove song from queue | `/remove position:3` |
| `/clear` | Clear the entire queue | `/clear` |

### Utility Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/help` | Show all commands | `/help` |
| `/ping` | Check bot latency | `/ping` |

## 📁 Project Structure

```

discord-music-bot/
├── src/
│   ├── commands/
│   │   ├── music/
│   │   │   ├── play.js
│   │   │   ├── pause.js
│   │   │   ├── resume.js
│   │   │   ├── skip.js
│   │   │   ├── stop.js
│   │   │   ├── queue.js
│   │   │   ├── loop.js
│   │   │   ├── shuffle.js
│   │   │   ├── volume.js
│   │   │   ├── nowplaying.js
│   │   │   ├── remove.js
│   │   │   └── clear.js
│   │   └── utility/
│   │       ├── help.js
│   │       └── ping.js
│   ├── events/
│   │   ├── client/
│   │   │   └── ready.js
│   │   └── interaction/
│   │       └── interactionCreate.js
│   ├── handlers/
│   │   ├── commandHandler.js
│   │   ├── eventHandler.js
│   │   └── deployCommands.js
│   ├── utils/
│   │   ├── musicPlayer.js
│   │   ├── queueManager.js
│   │   ├── validators.js
│   │   ├── embedBuilder.js
│   │   └── logger.js
│   ├── services/
│   │   └── youtubeService.js
│   ├── config/
│   │   ├── botConfig.js
│   │   └── constants.js
│   └── index.js
├── .env
├── .gitignore
├── package.json
└── README.md

```

## ⚙️ Configuration

Edit `src/config/botConfig.js` to customize bot behavior:

```

module.exports = {
// Music Configuration
music: {
defaultVolume: 50,
maxVolume: 100,
leaveOnEnd: true,
disconnectTime: 60000, // 1 minute
},

    // Embed Colors
    colors: {
        success: 0x00ff00,
        error: 0xff0000,
        info: 0x3498db,
        music: 0x9b59b6,
    },
    
    // Emojis
    emojis: {
        play: '▶️',
        pause: '⏸️',
        stop: '⏹️',
        skip: '⏭️',
        queue: '📜',
        loop: '🔁',
        shuffle: '🔀',
    }
    };

```

## 🔧 Troubleshooting

### Bot is not responding to commands

1. Make sure bot is online (check Discord)
2. Ensure slash commands are deployed: `npm run deploy`
3. Check bot has proper permissions in your server
4. Verify `.env` file has correct token

### "FFmpeg not found" error

Install FFmpeg following the [Prerequisites](#prerequisites) section above, or install via npm:

```

npm install ffmpeg-static

```

### "yt-dlp not initialized" error

Install yt-dlp globally:

```

npm install -g yt-dlp

```

Or add to PATH if manually installed.

### 403 Forbidden / YouTube blocking

YouTube occasionally blocks requests. This is usually temporary. Try:
1. Restart the bot
2. Update yt-dlp: `yt-dlp -U`
3. Wait a few minutes and try again

### Audio cutting out or stuttering

1. Check your internet connection
2. Lower the volume: `/volume level:50`
3. Try a different song
4. Restart the bot

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [discord.js](https://discord.js.org/) - Discord API wrapper
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube downloader
- [play-dl](https://github.com/play-dl/play-dl) - YouTube search and info
- [FFmpeg](https://ffmpeg.org/) - Audio processing

## 📧 Support

If you need help or have questions:

- Email: fauzanahsanudin@gmail.com

---

⭐ If you like this project, please give it a star on GitHub!

Made by [Fauzan A-25](https://github.com/Fauzan-A25)
