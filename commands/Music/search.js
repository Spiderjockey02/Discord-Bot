const yts = require('yt-search');

module.exports.run = async (bot, message, args, settings, ops) => {
	// make sure music plugin is enabled
	if (settings.MusicPlugin == false) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} This plugin is currently disabled.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	if (args.length == 0) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('find').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Just find top 10 songs on youtube
	// RENAME THIS TO SEARCH AND OTHER NAME
	const term = args.join(' ');
	const results = await yts(term);
	const videos = results.videos.slice(0, 10);
	let resp = '```ml\n';
	for (let i = 0; i < videos.length; i++) {
		if (videos[i] != undefined) {
			resp += `${i + 1}) ${videos[i].title} ${require('../../utils/time.js').toHHMMSS(videos[i].seconds)}\n`;
		}
	}
	resp += '\n\tPick a number from 1-10 or cancel.\n';
	resp += '```';
	message.channel.send(resp);
	function filter(msg) {
		const pattern = /(^[1-9][0-9]{0,1}$)/g;
		return pattern.test(msg.content) && parseInt(msg.content.match(pattern)[0]) <= 10;
	}
	const response = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] });
	console.log(response.first().message);
	if (isNaN(response.content)) {
		console.log(response.content);
		console.log(videos[parseInt(response.content)]);
		bot.commands.get('play').run(bot, message, [`${videos[response.content - 1].url}`], settings, ops);
	} else if (response.content == 'cancel') {
		console.log('cancel');
	} else {
		console.log('unknown');
	}
};
module.exports.config = {
	command: 'search',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'Search',
	category: 'Music',
	description: 'Finds for a song',
	usage: '!search [song]',
};
