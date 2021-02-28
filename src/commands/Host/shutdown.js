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
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
