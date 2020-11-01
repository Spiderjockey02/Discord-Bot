// Dependencies
const Discord = require('discord.js');
const superagent = require('superagent');

module.exports.run = async (bot, message, args, emojis) => {
	try {
		superagent.get('https://nekobot.xyz/api/image')
			.query({ type: 'hneko' })
			.end((err, response) => {
				const embed = new Discord.MessageEmbed()
					.setImage(response.body.message);
				message.channel.send(embed);
			});
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: hneko.`);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 5000 }));
		message.delete();
	}
};

module.exports.config = {
	command: 'hneko',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'hneko',
	category: 'Nsfw',
	description: 'Look at NSFW images.',
	usage: '${PREFIX}hneko',
};
