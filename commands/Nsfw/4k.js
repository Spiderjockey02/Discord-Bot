// Dependecies
const superagent = require('superagent');
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	superagent.get('https://nekobot.xyz/api/image')
		.query({ type: '4k' })
		.end((err, response) => {
			const embed = new Discord.MessageEmbed()
				.setImage(response.body.message);
			message.channel.send(embed);
		});
};

module.exports.config = {
	command: '4k',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: '4k',
	category: 'Nsfw',
	description: 'See some 4K images.',
	usage: '${PREFIX}4k',
};
