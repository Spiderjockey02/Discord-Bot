// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message, args, emojis) => {
	// This command can only be done in the official support server
	if (message.guild.id == bot.config.SupportServer.GuildID) {
		// This command can only be done by @suggestion
		if (message.member.roles.cache.find(role => role.id == bot.config.SupportServer.ModRole)) {
			const content = message.content.slice(12).split('-');
			const embed = new Discord.MessageEmbed()
				.setTitle(content[0])
				.setDescription(content[1])
				.setTimestamp()
				.setFooter(`${bot.user.username}'s Suggestion`, `https://cdn.discordapp.com/embed/avatars/${bot.user.discriminator % 5}.png`);
			message.guild.channels.cache.find(channel => channel.id == bot.config.SupportServer.SuggestionChannel).send(embed).then(async (msg) => {
				await msg.react('⬆');
				await msg.react('⬇');
			});
			// Tell user suggestion has been added
			if (message.deletable) message.delete();
			message.channel.send({ embed:{ color:3066993, description:`${emojis[1]} Suggestion has been added.` } }).then(m => m.delete({ timeout: 10000 }));
		}
	}
};

module.exports.config = {
	command: 'suggestion',
	aliases: ['suggest'],
};

module.exports.help = {
	name: 'suggestion',
	category: 'Host',
	description: 'Creates a suggestion (only for support server)',
	usage: '${PREFIX}suggestion <suggestion>',
};
