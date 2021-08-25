// Dependencies
const	Command = require('../../structures/Command.js');

/**
 * Shutdown command
 * @extends {Command}
*/
class Shutdown extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'shutdown',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Shutdowns the bot.',
			usage: 'shutdown',
			cooldown: 3000,
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// try and shutdown the server
		try {
			await message.channel.success('host/shutdown:success');
			await bot.logger.log(`Bot was shutdown by ${message.author.tag} in server: [${message.guild.id}]`);
			await bot.destroy();
			process.exit();
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = Shutdown;
