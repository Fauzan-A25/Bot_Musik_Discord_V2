const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MusicPlayer = require('../../utils/musicPlayer');
const QueueManager = require('../../utils/queueManager');
const YouTubeService = require('../../services/youtubeService');
const Validators = require('../../utils/validators');

module.exports = {
    name: 'play',
    description: 'Play a song from YouTube',
    category: 'music',
    cooldown: 3,
    
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from YouTube')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Song name or YouTube URL')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const query = interaction.options.getString('query');
            const member = interaction.member;
            const guild = interaction.guild;

            console.log('='.repeat(50));
            console.log('🎵 PLAY COMMAND STARTED');
            console.log('Query:', query);
            console.log('User:', member.user.tag);
            console.log('='.repeat(50));

            // Validations
            Validators.inVoiceChannel(member);
            
            const voiceChannel = member.voice.channel;
            Validators.hasVoicePermissions(voiceChannel, guild.members.me);

            // Initialize YouTube service
            await YouTubeService.initialize();

            // Get or create queue
            let queue = QueueManager.get(guild.id);
            
            if (!queue) {
                console.log('✅ Creating new queue...');
                queue = QueueManager.create(guild.id, interaction.channel, voiceChannel);
                
                // Connect to voice channel
                console.log('✅ Connecting to voice channel...');
                const { connection, player } = await MusicPlayer.connect(voiceChannel, interaction.channel);
                queue.connection = connection;
                queue.player = player;
                console.log('✅ Voice connection established');
            } else {
                console.log('✅ Using existing queue');
                Validators.sameVoiceChannel(member, guild.members.me);
            }

            // Process query
            let songs = [];
            const isUrl = YouTubeService.isYouTubeUrl(query);
            const urlType = isUrl ? YouTubeService.validateUrl(query) : null;

            console.log('📌 Query Type Check:');
            console.log('  - Is URL:', isUrl);
            console.log('  - URL Type:', urlType);

            if (urlType === 'playlist') {
                console.log('📋 Processing playlist...');
                const playlistData = await YouTubeService.getPlaylist(query);
                songs = playlistData.videos.map(video => ({
                    ...video,
                    requestedBy: interaction.user
                }));

                console.log(`✅ Loaded ${songs.length} songs from playlist`);

                const embed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('✅ Playlist Added to Queue')
                    .setDescription(`📜 Added **${songs.length}** songs from **${playlistData.title}**`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });

            } else if (urlType === 'video' || isUrl) {
                console.log('🎥 Processing video URL...');
                const videoInfo = await YouTubeService.getVideoInfo(query);
                
                console.log('📦 Video Info Received:');
                console.log('  - Title:', videoInfo.title);
                console.log('  - URL:', videoInfo.url);
                console.log('  - Duration:', videoInfo.durationFormatted);
                
                songs = [{ ...videoInfo, requestedBy: interaction.user }];

            } else {
                console.log('🔍 Searching YouTube...');
                const searchResults = await YouTubeService.search(query, 1);
                
                if (searchResults.length === 0) {
                    throw new Error('No results found for your search!');
                }

                console.log('📦 Search Result:');
                console.log('  - Title:', searchResults[0].title);
                console.log('  - URL:', searchResults[0].url);
                console.log('  - Duration:', searchResults[0].durationFormatted);

                songs = [{ ...searchResults[0], requestedBy: interaction.user }];
            }

            // Validate song object before adding to queue
            if (songs.length > 0) {
                console.log('\n🔍 VALIDATING SONG OBJECT:');
                const firstSong = songs[0];
                console.log('Song Object:', JSON.stringify({
                    title: firstSong.title,
                    url: firstSong.url,
                    duration: firstSong.duration,
                    durationFormatted: firstSong.durationFormatted,
                    hasUrl: !!firstSong.url,
                    urlType: typeof firstSong.url
                }, null, 2));

                // CRITICAL CHECK ✅
                if (!firstSong.url) {
                    console.error('❌ CRITICAL ERROR: Song URL is undefined!');
                    throw new Error('Failed to get song URL. Please try again or use a different search term.');
                }

                if (typeof firstSong.url !== 'string') {
                    console.error('❌ CRITICAL ERROR: Song URL is not a string!');
                    throw new Error('Invalid song URL format.');
                }
            }

            // Add songs to queue
            const wasEmpty = queue.isEmpty() && !queue.isPlaying;
            
            if (songs.length === 1) {
                console.log('➕ Adding song to queue...');
                queue.addSong(songs[0]);
                console.log('✅ Song added to queue');
                
                const embed = new EmbedBuilder()
                    .setColor(0x9b59b6)
                    .setTitle(wasEmpty ? '🎵 Now Playing' : '✅ Added to Queue')
                    .setDescription(`**[${songs[0].title}](${songs[0].url})**\n\n` +
                                  `⏳ Duration: \`${songs[0].durationFormatted}\`\n` +
                                  `👤 Requested by: ${songs[0].requestedBy}`)
                    .setTimestamp();
                
                if (songs[0].thumbnail) {
                    embed.setThumbnail(songs[0].thumbnail);
                }

                if (!wasEmpty) {
                    embed.addFields({
                        name: 'Position in Queue',
                        value: `#${queue.songs.length}`,
                        inline: true
                    });
                }

                await interaction.editReply({ embeds: [embed] });
            } else {
                console.log(`➕ Adding ${songs.length} songs to queue...`);
                queue.addSongs(songs);
                console.log('✅ Songs added to queue');
            }

            // Start playing
            if (wasEmpty) {
                console.log('▶️  Starting playback...');
                await MusicPlayer.play(queue);
            } else {
                console.log('⏸️  Song queued (not playing yet)');
            }

            console.log('='.repeat(50));
            console.log('✅ PLAY COMMAND COMPLETED');
            console.log('='.repeat(50) + '\n');

        } catch (error) {
            console.error('\n' + '='.repeat(50));
            console.error('❌ PLAY COMMAND ERROR:');
            console.error('Error Message:', error.message);
            console.error('Error Stack:', error.stack);
            console.error('='.repeat(50) + '\n');
            
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Playback Error')
                .setDescription(error.message || 'An error occurred while playing music!')
                .setTimestamp();
            
            if (interaction.deferred) {
                await interaction.editReply({ embeds: [embed] }).catch(console.error);
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            }
        }
    }
};
