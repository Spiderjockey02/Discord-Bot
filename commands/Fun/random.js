module.exports.run = async (bot, message, args) => {
	// Random number and facts command
	const max = 100000;
	// Make sure both entries are there
	if (!args[0] || !args[1]) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('random').help.usage}\`.` } }).then(m => m.delete({ timeout: 3000 }));
		return;
	}
	else {
		// Make sure both entries are numbers
		if (isNaN(args[0]) || isNaN(args[1])) {
			if (message.deletable) message.delete();
			message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('random').help.usage}\`.` } }).then(m => m.delete({ timeout: 3000 }));
			return;
		}
		// MAke sure they follow correct rules
		if ((args[1] < args[0]) || (args[0] === args[1]) || (args[1] > max) || (args[0] < 0)) {
			if (message.deletable) message.delete();
			message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('random').help.usage}\`.` } }).then(m => m.delete({ timeout: 3000 }));
			return;
		}
		// Math.random() * (args[1] - args[0]) + args[0]
		const r = Math.floor(Math.random() * (args[1] - args[0]) + args[0]) + 1;
		message.channel.send(`Random number: ${r}`);
	}
};
module.exports.config = {
	command: 'random',
	aliases: ['rnd'],
};
module.exports.help = {
	name: 'random',
	category: 'Fun',
	description: 'Sends a random number',
	usage: '!random [LowNum] [HighNum]',
};
