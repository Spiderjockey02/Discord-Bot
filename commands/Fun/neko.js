// Dependencies
const { Random } = require('something-random-on-discord');
const random = new Random();


module.exports.run = async (bot, message) => {
	try {
		const data = await random.getNeko();
		message.channel.send(data);
	} catch (e) {
		bot.logger.error(e.message);
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} An error has occured. Please try again.` } }).then(m => m.delete({ timeout: 3500 }));
	}
};

module.exports.config = {
	command: 'neko',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'neko',
	category: 'Fun',
	description: 'Have a nice picture of a cat.',
	usage: '!neko',
};
