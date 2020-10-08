// Dependencies
const Discord = require('discord.js');
const config = require('../../config.js');
const YouTubeAPI = require('simple-youtube-api');
const youtube = new YouTubeAPI(config.YoutubeAPI_Key);
const scdl = require('soundcloud-downloader');
// const ytdl = require('ytdl-core');

module.exports.run = async (bot, message, args, emojis, settings, ops) => {
	// check for bot permissions, song/playlist ( and if needed DJ role)
	if (!bot.musicHandler(message, args, emojis, settings)) {
		return;
	}
	// RegEx formulas
	const search = args.join(' ');
	const pattern = /^.*(youtu.be\/|list=)([^#]*).*/gi;
	const url = args[0];
	const urlValid = pattern.test(args[0]);
	let videos = [];
	// find video/song of playlist
	const msg = await message.channel.send('Gathering playlist information');
	if (urlValid) {
		// This gets videos/songs from youtube
		try {
			const playlist = await youtube.getPlaylist(url, { part: 'snippet' });
			videos = await playlist.getVideos(25, { part: 'snippet, contentDetails' });
			console.log(videos[1]);
			return;
		} catch (e) {
			bot.logger.error(e);
			return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Playlist not found.` } }).then(m => m.delete({ timeout: 10000 }));
		}
	} else if (scdl.isValidUrl(args[0])) {
		// gets videos/songs from soundcloud
		if (args[0].includes('/sets/')) {
			try {
				const playlist = await scdl.getSetInfo(args[0], bot.config.soundcloudAPI_Key);
				// console.log(playlist)
				videos = playlist.tracks.map(track => ({
					title: track.title,
					url: track.permalink_url,
					duration:  Math.ceil(track.duration / 1000),
					thumbnail: track.artwork_url,
				}));
			} catch (e) {
				message.channel.send(e.message);
			}
		}
	} else if (args[0].includes('open.spotify.com/album') || args[0].includes('spotify:album:') || args[0].includes('open.spotify.com/playlist') || args[0].includes('spotify:playlist:')) {
		return message.channel.send('Sorry, we currently don\'t support spotify playlists.');
	} else {
		// This will search for a playlist and get all videos/songs from it
		try {
			const results = await youtube.searchPlaylists(search, 1, { part: 'snippet' });
			const playlist = results[0];
			videos = await playlist.getVideos(25, { part: 'snippet' });
		} catch (e) {
			bot.logger.log(e);
			return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Playlist not found.` } }).then(m => m.delete({ timeout: 10000 }));
		}
	}

	// MOVE ALL THIS TO AUDIO PLAYER

	// get server information & join channel
	const data = ops.active.get(message.guild.id) || {};
	if (!data.connection) data.connection = await message.member.voice.channel.join();
	// deafen self (recieve less information from discord)
	data.connection.voice.setSelfDeaf(true);
	// add music variables
	data.guildID = message.guild.id;
	if (!data.queue) data.queue = [];
	if (!data.volume) data.volume = 100;
	if (!data.loopQueue) data.loopQueue = false;
	if (!data.loopSong) data.loopSong = false;
	if (!data.bassboost) data.bassboost = 0;
	if (!data.seek) data.seek = 0;
	// add songs to queue
	videos.forEach((video) => {
		data.queue.push({
			title: video.title,
			requester: message.author.id,
			url: video.url,
			duration: video.duration,
			thumbnail: video.thumbnail,
		});
	});

	// play the songs
	msg.delete();
	if (!data.dispatcher) {
		require('../../utils/AudioPlayer.js').run(bot, ops, data, message);
	} else {
		// show that songs where added to queue
		const embed = new Discord.MessageEmbed()
			.setTitle(`[[${videos.length}] songs Added to queue](${args[0]})`)
			.addField('Posititon in Queue:', `${data.queue.length - videos.length}`, true)
			.addField('Total added time:', 'Unknown', true);
		message.channel.send(embed);
	}
	// add songs to server queue
	ops.active.set(message.guild.id, data);
};
module.exports.config = {
	command: 'add-playlist',
	aliases: ['playlist', 'addplaylist'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'Playlist',
	category: 'Music',
	description: 'Adds a playlist to queue',
	usage: '${PREFIX}add-playlist <link>',
};
