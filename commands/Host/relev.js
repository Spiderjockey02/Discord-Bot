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
	const eventName = args[0].toLowerCase();
	console.log(bot._events);
	if (bot._events[eventName]) {
		try {
			const event = require(`../../events/${eventName}`);
			delete require.cache[require.resolve(`${event}.js`)];
			bot._events.delete(eventName);
			const pull = require(`${event}.js`);
			bot._events.set(eventName, pull);
		} catch (e) {
			console.log(e);
			return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Could not reload: \`${eventName}\`.` } }).then(m => m.delete({ timeout: 10000 }));
		}
	} else {
		return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} \`${eventName}\` isn't a command.` } }).then(m => m.delete({ timeout: 10000 }));
	}
	message.channel.send({ embed:{ color:3066993, description:`${bot.config.emojis.tick} Command: \`${eventName}\` has been reloaded.` } }).then(m => m.delete({ timeout: 8000 }));
	bot.logger.log(`Reloaded event: ${eventName}.js`);
};

module.exports.config = {
	command: 'relev',
	aliases: ['relev'],
};

module.exports.help = {
	name: 'reload event',
	category: 'Host',
	description: 'Reloads the bot',
	usage: '!relev [event]',
};
