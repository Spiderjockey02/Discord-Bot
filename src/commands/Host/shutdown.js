module.exports.run = async (bot, message) => {
	// Makes sure only the bot owner can run this command
	if (message.member.id == bot.config.ownerID) {
		try {
			// Shutdown the bot
			await message.channel.send('Oh.. ok goodbye :disappointed_relieved:');
			await bot.logger.log(`Bot was shutdown by ${message.author.username}#${message.author.discriminator} in server: [${message.guild.id}]`);
			process.exit();
		} catch(err) {
			if (bot.config.debug) bot.logger.error(`${err.message} - command: shutdown.`);
			message.channel.send(`ERROR: ${err.message}`);
		}
	}
};

module.exports.config = {
	command: 'shutdown',
	aliases: ['shutdown'],
};

module.exports.help = {
	name: 'shutdown',
	category: 'Host',
	description: 'Shutdowns the bot.',
	usage: '${PREFIX}shutdown',
};
