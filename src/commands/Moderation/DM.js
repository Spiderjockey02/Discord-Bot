// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class DM extends Command {
	constructor(bot) {
		super(bot, {
			name: 'dm',
			dirname: __dirname,
			aliases: ['direct-message', 'dmsg'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'DM a user',
			usage: 'dm <user> <message>',
			cooldown: 3000,
			examples: ['dm username Hello'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Make sure a member was mentioned
		if (!message.args[1]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// Get user
		const member = message.getMember();

		// Check if user has manage server permissions
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// send message
		try {
			const embed = new MessageEmbed()
				.setTitle('DM received')
				.setDescription(message.args.join(' ').slice(message.args[0].length))
				.setTimestamp()
				.setFooter(message.author.tag, message.author.displayAvatarURL({ format: 'png', size: 1024 }));
			await member[0].user.send(embed);
			message.channel.send(`Successfully sent DM to ${member[0].user.tag}.`);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
