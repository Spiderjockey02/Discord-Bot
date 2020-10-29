module.exports.run = async (bot, message, args, emojis, settings) => {
	// Makes sure only the bot owner can do this command
	if (message.member.id != bot.config.ownerID) return;
	// Checks to see if a command was specified
	if (!args[0]) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('reload').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 3000 }));
		return;
	}
	// delete message
	if (message.deletable) message.delete();
	// checks to make sure command exists
	const commandName = args[0].toLowerCase();
	if (bot.commands.has(commandName)) {
		// Finds command
		const command = bot.commands.get(commandName);
		// reloads command
		try {
			delete require.cache[require.resolve(`../${command.help.category}/${commandName}.js`)];
			bot.commands.delete(commandName);
			const pull = require(`../${command.help.category}/${commandName}.js`);
			bot.commands.set(commandName, pull);
		} catch(e) {
			console.log(e);
			return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Could not reload: \`${commandName}\`.` } }).then(m => m.delete({ timeout: 10000 }));
		}
	} else {
		return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} \`${commandName}\` isn't a command.` } }).then(m => m.delete({ timeout: 10000 }));
	}
	message.channel.send({ embed:{ color:3066993, description:`${emojis[1]} Command: \`${commandName}\` has been reloaded.` } }).then(m => m.delete({ timeout: 8000 }));
	bot.logger.log(`Reloaded Command: ${commandName}.js`);
};

module.exports.config = {
	command: 'reload',
};

module.exports.help = {
	name: 'reload',
	category: 'Host',
	description: 'Reloads a command.',
	usage: '${PREFIX}reload <command>',
};
