// Dependencies
const ms = require('ms');

module.exports.run = async (bot, message, args, emoji, settings) => {
	if (message.deletable) message.delete();

	// Make sure user can activate slowmode
	if (!message.member.hasPermission('MANAGE_CHANNELS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} You are missing the permission: \`MANAGE_CHANNELS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Check if bot can activate sowmode
	if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I am missing the permission: \`MANAGE_CHANNELS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MANAGE_CHANNELS\` in [${message.guild.id}].`);
		return;
	}
	// get time
	const time = ms(args[0]) / 1000;
	// Get slowmode time
	if (!time) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('slowmode').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));

	if(isNaN(time)) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('clear').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));

	if(time > 21600) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('clear').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));

	try {
		message.channel.setRateLimitPerUser(time);
		message.channel.send(`Slowmode Set to **${args[0]}**`).then(m => m.delete({ timeout:15000 }));
	} catch (err) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'slowmode',
	aliases: ['slow-mode'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Slowmode',
	category: 'moderation',
	description: 'Slowmodes a channel',
	usage: '${PREFIX}slowmode {time}',
	example: '${PREFIX}slowmode 1h',
};
