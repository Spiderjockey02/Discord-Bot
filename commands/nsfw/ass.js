// Dependecies
const superagent = require('superagent');
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	// Make sure the bot is NSFW
	if (bot.config.NSFWBot == false) return;
	// Make sure the message was sent in a NSFW channel
	if (message.channel.nsfw === true) {
		superagent.get('https://nekobot.xyz/api/image')
			.query({ type: 'ass' })
			.end((err, response) => {
				const embed = new Discord.MessageEmbed()
					.setImage(response.body.message);
				message.channel.send(embed);
			});
	} else {
		message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} This command can only be done in a \`NSFW\` channel.` } }).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'ass',
	aliases: ['arse'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'ass',
	category: 'ass',
	description: 'See some cheeky photos',
	usage: '!ass',
};
