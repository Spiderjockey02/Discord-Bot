const ms = require('ms');
module.exports.run = async (bot, message, args, emoji, settings) => {
	// Delete message
	if (message.deletable) message.delete();
	// Make sure user can ban users
	if (!message.member.hasPermission('BAN_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} You are missing the permission: \`BAN_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Check if bot has permission to ban user
	if (!message.guild.me.hasPermission('BAN_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I am missing the permission: \`BAN_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`BAN_MEMBERS\` in [${message.guild.id}].`);
		return;
	}
	// Get user and reason
	const banned = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
	const reason = (args.join(' ').slice(22)) ? args.join(' ').slice(22) : 'No reason given';
	// Make sure user is real
	if (!banned) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Ban user with reason
	try {
		if (args[1]) {
			// Makes sure it ends in d, h, m
			if (!args[1].endsWith('d') && !args[1].endsWith('h') && !args[1].endsWith('m')) {
				message.channel.send({ embed:{ color:15158332, description:`${emoji} Example on how to do a timed ban. \`${bot.commands.get('ban').help.example.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
				return;
			}
			if (isNaN(args[1][0])) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('ban').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
			setTimeout(function() {
				bot.commands.get('unban').run(bot, message, [`${banned.user.id}`], emoji);
			}, ms(args[1]));
		}
		message.guild.member(banned).ban({ reason: reason });
		message.channel.send({ embed:{ color:3066993, description:`${(message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.tick : ':white_check_mark:'} *${banned.user.username}#${banned.user.discriminator} was successfully banned*.` } }).then(m => m.delete({ timeout: 8000 }));
	} catch (err) {
		bot.logger.error(err.message);
		message.channel.send({ embed:{ color:15158332, description:`${emoji} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'ban',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
};

module.exports.help = {
	name: 'Ban',
	category: 'Moderation',
	description: 'Ban a user.',
	usage: '${PREFIX}ban <user> [reason] [time]',
	example: '${PREFIX}ban @badPerson Not good 1h',
};
