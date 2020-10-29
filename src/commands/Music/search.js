const yts = require('yt-search');

module.exports.run = async (bot, message, args, emojis, settings, ops) => {
	if (args.length == 0) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('search').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
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
	if (!isNaN(response.first().content)) {
		bot.commands.get('play').run(bot, message, [`${videos[response.first().content - 1].url}`], emojis, settings, ops);
	} else if (response.content == 'cancel') {
		message.channel.send('Search has been cancelled.');
	}
};
module.exports.config = {
	command: 'search',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'Search',
	category: 'Music',
	description: 'Searches for a song.',
	usage: '${PREFIX}search <song>',
};
