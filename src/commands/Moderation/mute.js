module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Check if user can mute users
	if (!message.member.hasPermission('MUTE_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'MUTE_MEMBERS').then(m => m.delete({ timeout: 10000 }));

	// check if bot can add 'mute' role to user
	if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
		bot.logger.error(`Missing permission: \`MANAGE_ROLES\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_ROLES').then(m => m.delete({ timeout: 10000 }));
	}

	// Check if bot can mute users
	if (!message.guild.me.hasPermission('MUTE_MEMBERS')) {
		bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'MUTE_MEMBERS').then(m => m.delete({ timeout: 10000 }));
	}

	// add user to role (if no role, make role)
	const member = bot.getUsers(message, args);

	// Make sure user isn't trying to punish themselves
	if (member[0].user.id == message.author.id) return message.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

	// get mute role
	let muteRole = message.guild.roles.cache.find(role => role.id == settings.MutedRole);
	// If role not found then make role
	if (!muteRole) {
		try {
			muteRole = await message.guild.roles.create({
				data: {
					name: 'Muted',
					color: '#514f48',
					permissions: ['READ_MESSAGE_HISTORY'],
				},
			});
			// update server with no muted role
			bot.updateGuild(message.channel.guild, { MutedRole: muteRole.id }, bot);
		} catch (e) {
			bot.logger.error(e.message);
		}
	}


	// add role to user
	try {
		member[0].roles.add(muteRole).then(async () => {
			// Make sure that the user is in a voice channel
			if (member[0].voice.channelID) {
				try {
					await member[0].voice.setMute(true);
					message.success(settings.Language, 'MODERATION/SUCCESSFULL_MUTE', member[0].user).then(m => m.delete({ timeout: 3000 }));
				} catch (err) {
					if (bot.config.debug) bot.logger.error(`${err.message} - command: mute {1}.`);
				}
			}
			// reply to user
			message.success(settings.Language, 'MODERATION/SUCCESSFULL_MUTE', member[0].user).then(m => m.delete({ timeout: 3000 }));
			// see if it was a tempmute
			if (args[1]) {
				const time = require('../../helpers/time-converter.js').getTotalTime(args[1], message, settings.Language);
				if (!time) return;
				setTimeout(() => {
					member[0].roles.remove(muteRole, 'Temporary mute expired.');
				}, time);
			}
		});
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: mute {2}.`);
	}
	// add timed unmute
};

module.exports.config = {
	command: 'mute',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES', 'MUTE_MEMBERS'],
};

module.exports.help = {
	name: 'Mute',
	category: 'Moderation',
	description: 'Mute a user.',
	usage: '${PREFIX}mute <user> [time]',
	example: '${PREFIX}mute NoisyUser 10m',
};
