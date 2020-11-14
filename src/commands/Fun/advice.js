// Dependencies
const { Random } = require('something-random-on-discord');
const random = new Random();

module.exports.run = async (bot, message, args, settings) => {
	try {
		const data = await random.getAdvice();
		message.channel.send(data);
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: advice.`);
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		if (message.deletable) message.delete();
	}
};

module.exports.config = {
	command: 'advice',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Advice',
	category: 'Fun',
	description: 'Get some random advice.',
	usage: '${PREFIX}advice',
};
