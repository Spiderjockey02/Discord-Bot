module.exports.run = async (bot, message, args, settings) => {
	// Make sure only bot owner can do this command
	if (!bot.config.ownerID.includes(message.author.id)) return;

	// try and shutdown the server
	try {
		await message.sendT(settings.Language, 'HOST/SHUTDOWN');
		await bot.logger.log(`Bot was shutdown by ${message.author.username}#${message.author.discriminator} in server: [${message.guild.id}]`);
		process.exit();
	} catch(err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: shutdown.`);
		message.error(settings.Language, 'HOST/SHUTDOWN_ERROR', err.message);
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
