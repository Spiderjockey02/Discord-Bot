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
			examples: ['kick username spamming chat'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check if user has permission to kick user
		if (!message.member.permissions.has('KICK_MEMBERS')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'KICK_MEMBERS').then(m => setTimeout(() => { m.delete(); }, 10000));

		// Check if bot has permission to kick user
		if (!message.guild.me.hasPermission('KICK_MEMBERS')) {
			bot.logger.error(`Missing permission: \`KICK_MEMBERS\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'KICK_MEMBERS').then(m => setTimeout(() => { m.delete(); }, 10000));
		}

		// Get user and reason
		const member = message.getMember();
		const reason = message.args[1] ? message.args.splice(1, message.args.length).join(' ') : bot.translate(settings.Language, 'NO_REASON');

		// Make sure user isn't trying to punish themselves
		if (member[0].user.id == message.author.id) return message.channel.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => setTimeout(() => { m.delete(); }, 10000));

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (member[0].hasPermission('ADMINISTRATOR') || member[0].roles.highest.comparePositionTo(message.guild.me.roles.highest) >= 0) {
			return message.channel.error(settings.Language, 'MODERATION/TOO_POWERFUL').then(m => setTimeout(() => { m.delete(); }, 10000));
		}

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
			message.channel.success(settings.Language, 'MODERATION/SUCCESSFULL_KICK', member[0].user).then(m => setTimeout(() => { m.delete(); }, 3000)
);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
		}
	}
};
