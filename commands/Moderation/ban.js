// Dependencies
const ms = require('ms');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();
	// Make sure user can ban users
	if (!message.member.hasPermission('BAN_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`BAN_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Check if bot has permission to ban user
	if (!message.guild.me.hasPermission('BAN_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am missing the permission: \`BAN_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`BAN_MEMBERS\` in [${message.guild.id}].`);
		return;
	}
	// Get user and reason
	const user = bot.GetUser(message, args);
	const reason = (args.join(' ').slice(22)) ? args.join(' ').slice(22) : 'No reason given';
	// Make sure user is real
	if (!user) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Make sure user isn't trying to punish themselves
	if (user.user.id == message.author.id) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You can't punish yourself.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Make sure user user does not have ADMINISTRATOR permissions
	if (user.hasPermission('ADMINISTRATOR')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am unable to ban this user due to their power.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Ban user with reason and check if timed ban
	try {
		if (args[1]) {
			// Makes sure it ends in d, h, m
			if (!args[1].endsWith('d') && !args[1].endsWith('h') && !args[1].endsWith('m')) {
				message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Example on how to do a timed ban. \`${bot.commands.get('ban').help.example.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
				return;
			}
			// Make sure its a number
			if (isNaN(args[1][0])) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('ban').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
			// Only 1 time interval can be used
			if (args[1].length - args[1].replace(/[A-Za-z]/g, '').length != 1) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} For now only \`1\` time interval can be used.` } }).then(m => m.delete({ timeout: 5000 }));
			setTimeout(function() {
				bot.commands.get('unban').run(bot, message, [`${user.user.id}`], emojis);
			}, ms(args[1]));
		}
		await user.ban({ reason: reason });
		message.channel.send({ embed:{ color:3066993, description:`${emojis[1]} *${user.user.username}#${user.user.discriminator} was successfully banned*.` } }).then(m => m.delete({ timeout: 8000 }));
		bot.Stats.BannedUsers++;
	} catch (err) {
		bot.logger.error(`${err.message} when running command: ban.`);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
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
