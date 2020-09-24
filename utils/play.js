// when the bot finishes
const ytdlDiscord = require('ytdl-core-discord');
const scdl = require('soundcloud-downloader');
const Discord = require('discord.js');

function finish(bot, ops, dispatcher, message) {
	const fetched = ops.active.get(dispatcher.guildID);
	fetched.queue.shift();
	// Plays next song if there is one
	if (fetched.queue.length > 0) {
		ops.active.set(dispatcher.guildID, fetched);
		require('../Utils/play.js').run(bot, ops, fetched, message);
	} else {
		ops.active.delete(dispatcher.guildID);
		const vc = bot.guilds.cache.get(dispatcher.guildID).me.voice.channel;
		if (vc) vc.leave();
		message.channel.send('Goodbye :wave:').then(m => m.delete({ timeout: 2500 }));
	}
}

module.exports.run = async (bot, ops, data, message) => {
	// Get stream type
	let streamType = data.queue[0].url.includes('youtube.com') ? 'opus' : 'ogg/opus';
	// get stream
	let stream;
	try {
		if (data.queue[0].url.includes('youtube.com')) {
			stream = await ytdlDiscord(data.queue[0].url, { highWaterMark: 1 << 25 });
		} else if (data.queue[0].url.includes('soundcloud.com')) {
			try {
				stream = await scdl.downloadFormat(
					data.queue[0].url,
					scdl.FORMATS.OPUS,
					bot.config.soundcloudAPI_Key,
				);
			} catch (error) {
				stream = await scdl.downloadFormat(
					data.queue[0].url,
					scdl.FORMATS.MP3,
					bot.config.soundcloudAPI_Key,
				);
				streamType = 'unknown';
			}
		}
	} catch (error) {
		// URL was not youtube or soundcloud
		if (data.queue) {
			// play the next song
			data.queue.shift();
			require('../utils/play.js').run(bot, ops, data, message);
		}
		bot.logger.error(`${error.message ? error.message : error}`);
		return message.channel.send(`Error: ${error.message ? error.message : error}`);
	}
	// create message
	const embed = new Discord.MessageEmbed()
		.setThumbnail(data.queue[0].thumbnail)
		.addFields(
			{ name: 'Now playing:', value: `[${data.queue[0].title}](${data.queue[0].url})` },
			{ name: 'Duration:', value: `${require('../Utils/time.js').toHHMMSS(data.queue[0].duration)}` },
		);
	// play song
	bot.channels.cache.get(message.channel.id).send(embed).then(m => m.delete({ timeout: data.queue[0].duration * 1000 }));
	data.dispatcher = await data.connection.play(stream, { type: streamType, audioonly: true, volume: data.volume / 100 });
	data.dispatcher.on('disconnect', () => {
		console.log('goodbye');
		ops.active.delete(data.dispatcher.guildID);
	});
	data.dispatcher.once('finish', function() { finish(bot, ops, this, message);});
	data.dispatcher.guildID = data.guildID;
};
