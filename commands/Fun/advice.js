// Dependencies
const { Random } = require('something-random-on-discord');
const random = new Random();


module.exports.run = async (bot, message) => {
	const data = await random.getAdvice();
	try {
		message.channel.send(data);
	} catch (e) {
		bot.logger.error(e.message);
		message.channel.send().then(m => m.delete({ timeout: 3500 }));
	}
};

module.exports.config = {
	command: 'advice',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Advice',
	category: 'Fun',
	description: 'Get some advice',
	usage: '!advice',
};
