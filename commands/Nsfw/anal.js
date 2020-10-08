// Dependecies
const superagent = require('superagent');
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	superagent.get('https://nekobot.xyz/api/image')
		.query({ type: 'anal' })
		.end((err, response) => {
			const embed = new Discord.MessageEmbed()
				.setImage(response.body.message);
			message.channel.send(embed);
		});
};

module.exports.config = {
	command: 'anal',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'anal',
	category: 'Nsfw',
	description: 'See some cheeky photos',
	usage: '${PREFIX}anal',
};
