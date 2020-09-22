// Dependencies
const Discord = require('discord.js');
const config = require('../../config.js');
const YouTubeAPI = require('simple-youtube-api');
const youtube = new YouTubeAPI(config.YoutubeAPI_Key);
const scdl = require('soundcloud-downloader');
const { getData } = require('spotify-url-info');
module.exports.run = async (bot, message, args, settings, ops) => {
	// Checks to see if music is enabled or the server
	if (settings.MusicPlugin == false) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} This plugin is currently disabled.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Check if bot can see user in channel (the user is in a channel)
	if (!message.member.voice.channelID) {
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} You are not connected to a voice channel.` } }).then(m => m.delete({ timeout: 10000 }));
		message.delete();
		return;
	}
	// Check if bot can join channel
	if (!message.guild.me.hasPermission('CONNECT')) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`CONNECT\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`CONNECT\` in [${message.guild.id}]`);
		return;
	}
	// Check if bot can speak in channel
	if (!message.guild.me.hasPermission('SPEAK')) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`SPEAK\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`SPEAK\` in [${message.guild.id}]`);
		return;
	}
	// Check if an 'entry' was added
	if (args.length == 0) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('playlist').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));

	// RegEx formulas
	const search = args.join(' ');
	const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
	const url = args[0];
	const urlValid = pattern.test(args[0]);

	// find video/song of playlist
	const msg = await message.channel.send('Gathering playlist information');
	if (urlValid) {
		// This gets videos/songs from youtube
		try {
			const playlist = await youtube.getPlaylist(url, { part: 'snippet' });
			const videos = await playlist.getVideos(25, { part: 'snippet' });
		}
		catch (e) {
			bot.logger.error(e);
			return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Playlist not found.` } }).then(m => m.delete({ timeout: 10000 }));
		}
	}
	else if (scdl.isValidUrl(args[0])) {
		// gets videos/songs from soundcloud
		if (args[0].includes('/sets/')) {
			try {
				const playlist = await scdl.getSetInfo(args[0], bot.config.soundcloudAPI_Key);
				// console.log(playlist)
				const videos = playlist.tracks.map(track => ({
					title: track.title,
					url: track.permalink_url,
					duration:  Math.ceil(track.duration / 1000),
					thumbnail: track.artwork_url,
				}));
			}
			catch (e) {
				message.channel.send(e.message);
			}
		}
	}
	else if (args[0].includes('open.spotify.com/album') || args[0].includes('spotify:album:') || args[0].includes('open.spotify.com/playlist') || args[0].includes('spotify:playlist:')) {
		const r = await getData(args[0]);
		const videos = r.tracks.items;
		videos.forEach((video) => {
			if (video.track.album != undefined) {
				youtube.searchVideos(`${video.track.name} | ${video.track.album.name}`, 1).then(results => {
					console.log(results);
				});
			}
		});
		return;
	}
	else {
		// This will search for a playlist and get all videos/songs from it
		try {
			const results = await youtube.searchPlaylists(search, 1, { part: 'snippet' });
			const playlist = results[0];
			var videos = await playlist.getVideos(25, { part: 'snippet' });
		}
		catch (e) {
			bot.logger.log(e);
			return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Playlist not found.` } }).then(m => m.delete({ timeout: 10000 }));
		}
	}
	// get server information & join channel
	const data = ops.active.get(message.guild.id) || {};
	if (!data.connection) data.connection = await message.member.voice.channel.join();
	data.connection.voice.setSelfDeaf(true); // deafen self (recieve less information from discord)
	if (!data.queue) data.queue = [];
	data.guildID = message.guild.id;
	data.volume = 100;
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
	msg.delete({ timeout: 1000 });
	if (!data.dispatcher) {
		require('../../Utils/play.js').run(bot, ops, data, message);
	}
	else {
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
	aliases: ['playlist'],
};
module.exports.help = {
	name: 'Playlist',
	category: 'Music',
	description: 'Adds a playlist to queue',
	usage: '!playlist {playlist}',
};
