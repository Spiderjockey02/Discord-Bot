module.exports.run = async (bot, message, args, settings) => {
	// Get the right emoji (just in case bot dosen't have external emoji permission)
	const emoji = (message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.cross : ':negative_squared_cross_mark:';
	// Random number and facts command
	const max = 100000;
	// Make sure both entries are there
	if (!args[0] || !args[1]) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('random').help.usage.replace('${prefix}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 3000 }));
		return;
	} else {
		// Make sure both entries are numbers
		if (isNaN(args[0]) || isNaN(args[1])) {
			if (message.deletable) message.delete();
			message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('random').help.usage.replace('${prefix}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 3000 }));
			return;
		}
		// Make sure they follow correct rules
		if ((args[1] < args[0]) || (args[0] === args[1]) || (args[1] > max) || (args[0] < 0)) {
			if (message.deletable) message.delete();
			message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('random').help.usage.replace('${prefix}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 3000 }));
			return;
		}
		const r = Math.floor(Math.random() * (args[1] - args[0]) + args[0]) + 1;
		message.channel.send(`Random number: ${r}`);
	}
};
module.exports.config = {
	command: 'random',
	aliases: ['rnd'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};
module.exports.help = {
	name: 'random',
	category: 'Fun',
	description: 'Replies with a random number.',
	usage: '${prefix}random <LowNum> <HighNum>',
	example: '${prefix}random 1 10',
};
