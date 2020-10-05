// Dependencies
const { Random } = require('something-random-on-discord');
const random = new Random();

module.exports.run = async (bot, message) => {
	// Because some responses can have swear words so keep servers SFW
	if (message.channel.nsfw === true || message.channel.type == 'dm') {
		try {
			const data = await random.getAdvice();
			message.channel.send(data);
		} catch (err) {
			bot.logger.error(err.message);
			message.channel.send({ embed:{ color:15158332, description:`${(message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.cross : ':negative_squared_cross_mark:'} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
			message.delete();
		}
	} else {
		message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${(message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.cross : ':negative_squared_cross_mark:'} This command can only be done in a \`NSFW\` channel.` } }).then(m => m.delete({ timeout: 5000 }));
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
	usage: '${prefix}advice',
};
