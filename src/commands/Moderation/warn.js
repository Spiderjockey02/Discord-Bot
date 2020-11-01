module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();
	// Check to see if user can kick members
	if (!message.member.hasPermission('KICK_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`KICK_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('warn').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Get user to warn
	const wUser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
	if (!wUser) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Make sure user isn't trying to ban themselves
	if (wUser.user.id == message.author.id) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You can't punish yourself.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Make sure that the user that is getting warned has administrator permissions
	if (wUser.hasPermission('ADMINISTRATOR')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am unable to warn this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Get reason for warning
	const wReason = (args.join(' ').slice(22)) ? args.join(' ').slice(22) : 'No reason given';
	// Warning is sent to warning manager
	try {
		await require('../../modules/plugins/warning').run(bot, message, emojis, wUser, wReason, settings);
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: warn.`);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'warn',
	aliases: ['warning'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
};

module.exports.help = {
	name: 'Warning',
	category: 'Moderation',
	description: 'Warn a user.',
	usage: '${PREFIX}warn <user> [time] [reason]',
	example: '${PREFIX}warn @NaughtyPerson 10m Was spamming chat.',
};
