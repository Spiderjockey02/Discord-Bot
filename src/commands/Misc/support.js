// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Support extends Command {
	constructor(bot) {
		super(bot, {
			name: 'support',
			dirname: __dirname,
			aliases: ['sup'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get support on the bot.',
			usage: 'support',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		const embed = new MessageEmbed()
			.setTitle(message.translate(settings.Language, 'MISC/SUPPORT_TITLE', bot.user.username))
			.setDescription(message.translate(settings.Language, 'MISC/SUPPORT_DESC', [`${bot.config.SupportServer.link}`, `${bot.config.websiteURL}`]));
		message.channel.send(embed);
	}
};
