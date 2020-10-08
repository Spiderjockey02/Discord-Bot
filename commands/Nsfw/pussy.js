// Dependecies
const superagent = require('superagent');
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	superagent.get('https://nekobot.xyz/api/image')
		.query({ type: 'pussy' })
		.end((err, response) => {
			const embed = new Discord.MessageEmbed()
				.setImage(response.body.message);
			message.channel.send(embed);
		});
};

module.exports.config = {
	command: 'pussy',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'pussy',
	category: 'Nsfw',
	description: 'See some cheeky photos',
	usage: '${PREFIX}pussy',
};
