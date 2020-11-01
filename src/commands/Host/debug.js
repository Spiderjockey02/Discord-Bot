module.exports.run = async (bot, message, args) => {
	// turn on / off the debug
	if (!args[0]) {
		message.channel.send(`Debug is currently: \`${bot.config.debug}\`.`);
	} else if (args[0].toLowerCase() == 'true' || args[0].toLowerCase() == 'false') {
		bot.config.debug = args[0];
		message.channel.send(`Debug has been set to \`${args[0]}\`.`);
	} else {
		message.channel.send('Debug can only be set to true or false');
	}
};

module.exports.config = {
	command: 'debug',
	aliases: ['de-bug'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Debug',
	category: 'Host',
	description: 'Turn on or off the debug.',
	usage: '${PREFIX}debug <true | false>',
};
