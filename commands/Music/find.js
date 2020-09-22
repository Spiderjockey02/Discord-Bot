// const yts = require('yt-search');

module.exports.run = async (bot, message, args, settings) => {
	// make sure music plugin is enabled
	if (settings.MusicPlugin == false) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} This plugin is currently disabled.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	if (args.length == 0) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('find').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Just find top 10 songs on youtube
	// RENAME THIS TO SEARCH AND OTHER NAME
};
module.exports.config = {
	command: 'find',
	aliases: ['search'],
};
module.exports.help = {
	name: 'Find',
	category: 'Music',
	description: 'Finds for a song',
	usage: '!find [song]',
};
