module.exports.run = async (bot, message, args, settings) => {
	// Check if user can mute users
	if (!message.member.hasPermission('MUTE_MEMBERS')) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`MUTE_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// check if bot can add 'mute' role to user
	if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`MANAGE_ROLES\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MANAGE_ROLES\` in [${message.guild.id}]`);
		return;
	}
	// Check if bot can mute users
	if (!message.guild.me.hasPermission('MUTE_MEMBERS')) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`MUTE_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}]`);
		return;
	}
	// add user to role (if no role, make role)
	const user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
	if (!user) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	let muteRole = message.guild.roles.cache.find(role => role.name == settings.MutedRole);
	if (!muteRole) {
		// Make the role
		try {
			muteRole = await message.guild.roles.create({
				data: {
					name: 'Muted',
					color: '#514f48',
					permissions: ['READ_MESSAGE_HISTORY'],
				},
			});
		}
		catch (e) {
			bot.logger.error(e);
		}
	}
	user.voice.setMute(true);
	user.roles.add(muteRole).then(() => {
		// reply to user
		console.log(user);
		message.channel.send({ embed:{ color:3066993, description:`${bot.config.emojis.tick} *${user.user.username} was successfully muted*.` } }).then(m => m.delete({ timeout: 7000 }));
	});
};

module.exports.config = {
	command: 'mute',
	aliases: ['mute'],
};

module.exports.help = {
	name: 'Mute',
	category: 'Guild',
	description: 'Mutes a user',
	usage: '!mute {user} [reason]',
};
