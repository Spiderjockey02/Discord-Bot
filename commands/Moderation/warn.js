module.exports.run = async (bot, message, args, emoji, settings) => {
	if (message.deletable) message.delete();
	// Check to see if user can kick members
	if (!message.member.hasPermission('KICK_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} You are missing the permission: \`KICK_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Get user to warn
	const wUser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
	if (!wUser) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Make sure that the user that is getting warned has administrator permissions
	if (wUser.hasPermission('ADMINISTRATOR')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I am unable to warn this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Get reason for warning
	const wReason = (args.join(' ').slice(22)) ? args.join(' ').slice(22) : 'No reason given';
	// Warning is sent to warning manager
	require('../../modules/plugins/warning').run(bot, message, wUser, wReason, settings);
};

module.exports.config = {
	command: 'warn',
	aliases: ['warning'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
};

module.exports.help = {
	name: 'Warning',
	category: 'Moderation',
	description: 'Warns a user',
	usage: '${PREFIX}warn <user> [time] [reason]',
};
