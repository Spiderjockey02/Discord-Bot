module.exports.run = async (bot, message, args, emoji, settings) => {
	if (message.deletable) message.delete();
	// Check if user can mute users
	if (!message.member.hasPermission('MUTE_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} You are missing the permission: \`MUTE_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// check if bot can add 'mute' role to user
	if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I am missing the permission: \`MANAGE_ROLES\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MANAGE_ROLES\` in [${message.guild.id}].`);
		return;
	}
	// Check if bot can mute users
	if (!message.guild.me.hasPermission('MUTE_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I am missing the permission: \`MUTE_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
		return;
	}
	// add user to role (if no role, make role)
	const user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
	if (!user) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
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
			bot.logger.error(e);
		}
	}
	// Check to see if user is in a voice channel
	if (user.voice) {
		try {
			user.voice.setMute(true);
		} catch (e) {
			bot.logger.error('Unable to mute user eventhough they are in a voice channel');
		}
	}
	// add role to user
	try {
		user.roles.add(muteRole).then(() => {
			// reply to user
			message.channel.send({ embed:{ color:3066993, description:`${bot.config.emojis.tick} *${user.user.username} was successfully muted*.` } }).then(m => m.delete({ timeout: 7000 }));
		});
	} catch (error) {
		bot.logger.error(`${error.message ? error.message : error}`);
	}
};

module.exports.config = {
	command: 'mute',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES', 'MUTE_MEMBERS'],
};

module.exports.help = {
	name: 'Mute',
	category: 'moderation',
	description: 'Mutes a user',
	usage: '${PREFIX}mute <user> [time]',
};
