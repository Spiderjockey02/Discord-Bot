// Dependencies
const { shorten } = require('tinyurl');

module.exports.run = async (bot, message, args, settings) => {
	const mes = message.content.split(' ').slice(1).join(' ');
	try {
		shorten(mes, function(res) {
			message.channel.send(res);
		});
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: shorturl.`);
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 })).then(m => m.delete({ timeout: 10000 }));
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
