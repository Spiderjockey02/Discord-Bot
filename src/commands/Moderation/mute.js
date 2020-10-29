// Dependencies
const ms = require('ms');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();
	// Check if user can mute users
	if (!message.member.hasPermission('MUTE_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`MUTE_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// check if bot can add 'mute' role to user
	if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am missing the permission: \`MANAGE_ROLES\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MANAGE_ROLES\` in [${message.guild.id}].`);
		return;
	}
	// Check if bot can mute users
	if (!message.guild.me.hasPermission('MUTE_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am missing the permission: \`MUTE_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
		return;
	}
	// add user to role (if no role, make role)
	const user = bot.GetUser(message, args);
	if (!user) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Make sure user isn't trying to punish themselves
	if ((user.user.id == message.author.id) && (message.author.id != bot.config.ownerID)) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You can't punish yourself.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
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
	// Make sure that the user is in a voice channel
	if (user.voice.channelID) {
		try {
			await user.voice.setMute(true);
			message.channel.send({ embed:{ color:3066993, description:`${emojis[1]} *${user.user.username}#${user.user.discriminator} was successfully muted*.` } }).then(m => m.delete({ timeout: 3000 }));
		} catch (err) {
			bot.logger.error(`${err.message} when running command: mute. {1}`);
		}
	}
	// add role to user
	try {
		user.roles.add(muteRole).then(() => {
			// reply to user
			message.channel.send({ embed:{ color:3066993, description:`${emojis[1]} *${user.user.username}#${user.user.discriminator} was successfully muted*.` } }).then(m => m.delete({ timeout: 7000 }));
			// see if it was a tempmute
			if (args[1]) {
				const time = require('../../utils/Time-Handler.js').getTotalTime(args[1], message, emojis);
				if (!time) return;
				setTimeout(() => {
					user.roles.remove(muteRole, 'Temporary mute expired.');
				}, time);
			}
		});
	} catch (err) {
		bot.logger.error(`${err.message} when running command: mute. {2}`);
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
