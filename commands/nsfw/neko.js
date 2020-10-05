// Dependencies
const Discord = require('discord.js');
const superagent = require('superagent');

module.exports.run = async (bot, message, args, emoji) => {
	// Make sure the bot is NSFW
	if (bot.config.NSFWBot == false) return;
	// Make sure the message was sent in a NSFW channel
	if (message.channel.nsfw === true || message.channel.type == 'dm') {
		const word = (message.channel.nsfw === true || message.channel.type == 'dm') ? 'hneko' : 'neko';
		superagent.get('https://nekobot.xyz/api/image')
			.query({ type: word })
			.end((err, response) => {
				const embed = new Discord.MessageEmbed()
					.setImage(response.body.message);
				message.channel.send(embed);
			});
	} else {
		message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emoji} This command can only be done in a \`NSFW\` channel.` } }).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'neko',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'neko',
	category: 'nsfw',
	description: 'Have a nice picture of a cat.',
	usage: '${PREFIX}neko',
};
