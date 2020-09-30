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
	console.log(bot);
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
