const Snowshot = require('../../base/screenshot');
const window = new Snowshot();
const { MessageAttachment } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	try {
		window.screenshot(args[0]).then(data => {
			if (!data) {
				return message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			} else {
				const attachment = new MessageAttachment(data, 'website.png');
				message.channel.send(attachment);
			}
		});
	} catch (err) {
		if (message.deletable) message.delete();
		bot.logger.error(err.message);
		return message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'screenshot',
	aliases: ['ss'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Screenshot',
	category: 'Fun',
	description: 'Get a screenshot of a website.',
	usage: '${PREFIX}screenshot <url>',
};
