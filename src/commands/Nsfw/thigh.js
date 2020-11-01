// Dependecies
const superagent = require('superagent');
const Discord = require('discord.js');

module.exports.run = async (bot, message, args, emojis) => {
	try {
		superagent.get('https://nekobot.xyz/api/image')
			.query({ type: 'thigh' })
			.end((err, response) => {
				const embed = new Discord.MessageEmbed()
					.setImage(response.body.message);
				message.channel.send(embed);
			});
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: thigh.`);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 5000 }));
		message.delete();
	}
};
module.exports.config = {
	command: 'thigh',
	aliases: ['thighs'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'thigh',
	category: 'Nsfw',
	description: 'Look at NSFW images.',
	usage: '${PREFIX}thigh',
};
