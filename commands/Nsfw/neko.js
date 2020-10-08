// Dependencies
const Discord = require('discord.js');
const superagent = require('superagent');

module.exports.run = async (bot, message) => {
	superagent.get('https://nekobot.xyz/api/image')
		.query({ type: 'hneko' })
		.end((err, response) => {
			const embed = new Discord.MessageEmbed()
				.setImage(response.body.message);
			message.channel.send(embed);
		});
};

module.exports.config = {
	command: 'neko',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'neko',
	category: 'Nsfw',
	description: 'Have a nice picture of a cat.',
	usage: '${PREFIX}neko',
};
