// Dependencies
const { Random } = require('something-random-on-discord');
const random = new Random();

module.exports.run = async (bot, message, args, emojis) => {
	try {
		const data = await random.getAdvice();
		message.channel.send(data);
	} catch (err) {
		bot.logger.error(err.message);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 5000 }));
		message.delete();
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
