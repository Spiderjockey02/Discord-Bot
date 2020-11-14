// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Send support info to user
	const embed = new MessageEmbed()
		.setTitle(message.translate(settings.Language, 'MISC/SUPPORT_TITLE', bot.user.username))
		.setDescription(message.translate(settings.Language, 'MISC/SUPPORT_DESC', [`${bot.config.SupportServer.link}`, `${bot.config.Dashboard.domain}`]));
	message.channel.send(embed);
};

module.exports.config = {
	command: 'support',
	aliases: ['sup'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'support',
	category: 'Misc',
	description: 'Get support on the bot.',
	usage: '${PREFIX}support',
};
