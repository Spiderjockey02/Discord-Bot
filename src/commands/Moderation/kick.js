// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Kick extends Command {
	constructor(bot) {
		super(bot, {
			name: 'kick',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: ['KICK_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
			description: 'Kick a user.',
			usage: 'kick <user> [reason]',
			cooldown: 5000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check if user has permission to kick user
		if (!message.member.hasPermission('KICK_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));

		// Check if bot has permission to kick user
		if (!message.guild.me.hasPermission('KICK_MEMBERS')) {
			bot.logger.error(`Missing permission: \`KICK_MEMBERS\` in [${message.guild.id}].`);
			return message.error(settings.Language, 'MISSING_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));
		}

		// Get user and reason
		const member = message.guild.getMember(message, args);
		const reason = (args.join(' ').slice(22)) ? args.join(' ').slice(22) : message.translate(settings.Language, 'NO_REASON');

		// Make sure user isn't trying to punish themselves
		if (member[0].user.id == message.author.id) return message.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

		// Make sure user user does not have ADMINISTRATOR permissions
		if (member[0].hasPermission('ADMINISTRATOR')) return message.error(settings.Language, 'MODERATION/TOO_POWERFUL').then(m => m.delete({ timeout: 10000 }));

		// Kick user with reason
		try {
			// send DM to user
			try {
				const embed = new MessageEmbed()
					.setTitle('KICKED')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(`You have been kicked from ${message.guild.name}.`)
					.addField('Kicked by:', message.author.tag, true)
					.addField('Reason:', reason, true);
				await member[0].send(embed);
				// eslint-disable-next-line no-empty
			} catch (e) {}

			// kick user from guild
			await member[0].kick({ reason: reason });
			message.success(settings.Language, 'MODERATION/SUCCESSFULL_KICK', member[0].user).then(m => m.delete({ timeout: 3000 }));
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
