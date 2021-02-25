// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class Shutdown extends Command {
	constructor(bot) {
		super(bot, {
			name: 'shutdown',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Shutdowns the bot.',
			usage: 'shutdown',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// try and shutdown the server
		try {
			await message.sendT(settings.Language, 'HOST/SHUTDOWN');
			await bot.logger.log(`Bot was shutdown by ${message.author.username}#${message.author.discriminator} in server: [${message.guild.id}]`);
			process.exit();
		} catch(err) {
			if (bot.config.debug) bot.logger.error(`${err.message} - command: shutdown.`);
			message.error(settings.Language, 'HOST/SHUTDOWN_ERROR', err.message);
		}
	}
};
