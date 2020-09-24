module.exports.run = async (bot, message, args) => {
	// Makes sure only the bot owner can do this command
	if (message.member.id != bot.config.ownerID) return;
	// Checks to see if a command was specified
	if (!args[0]) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('reload').help.usage}\`.` } }).then(m => m.delete({ timeout: 3000 }));
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
			return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Could not reload: \`${args[0].toLowerCase()}\`.` } }).then(m => m.delete({ timeout: 10000 }));
		}
	} else {
		return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} \`${args[0].toLowerCase()}\` isn't a command.` } }).then(m => m.delete({ timeout: 10000 }));
	}
	message.channel.send({ embed:{ color:3066993, description:`${bot.config.emojis.tick} Command: \`${args[0].toLowerCase()}\` has been reloaded.` } }).then(m => m.delete({ timeout: 8000 }));
	bot.logger.log(`Reloaded Command: ${commandName}.js`);
};

module.exports.config = {
	command: 'reload',
	aliases: ['rel'],
};

module.exports.help = {
	name: 'reload',
	category: 'Host',
	description: 'Reloads the bot',
	usage: '!reload [command]',
};
