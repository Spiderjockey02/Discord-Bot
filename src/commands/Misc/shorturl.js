// Dependencies
const TinyURL = require('tinyurl');

module.exports.run = async (bot, message, args, emojis) => {
	const mes = message.content.split(' ').slice(1).join(' ');
	try {
		TinyURL.shorten(mes, function(res) {
			message.channel.send(res);
		});
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: shorturl.`);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'shorturl',
	aliases: ['surl', 'short-url'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'shorturl',
	category: 'Misc',
	description: 'Creates a shorturl on the URl you sent.',
	usage: '${PREFIX}shorturl',
};
