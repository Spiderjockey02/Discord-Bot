// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	// This command can only be done in the official support server
	if (message.guild.id == 658113349384667198) {
		// This command can only be done by @suggestion
		if (message.member.roles.cache.find(role => role.id == '741032118536241314')) {
			const content = message.content.slice(12).split('-');
			const embed = new Discord.MessageEmbed()
				.setTitle(content[0])
				.setDescription(content[1])
				.setTimestamp()
				.setFooter('EggLord Suggestion', 'https://cdn.discordapp.com/embed/avatars/0.png');
			message.guild.channels.cache.find(channel => channel.id == '740673962442490007').send(embed).then(async (msg) => {
				await msg.react('⬆');
				await msg.react('⬇');
			});
			// Tell user suggestion has been added
			if (message.deletable) message.delete();
			message.channel.send({ embed:{ color:3066993, description:`${bot.config.emojis.tick} Suggestion has been added.` } }).then(m => m.delete({ timeout: 10000 }));
		}
	}
};

module.exports.config = {
	command: 'suggestion',
	aliases: ['suggestion'],
};

module.exports.help = {
	name: 'suggestion',
	category: 'Host',
	description: 'Creates a suggestion (only for support server)',
	usage: '!suggestion {suggestion}',
};
