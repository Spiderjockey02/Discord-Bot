// Dependencies
const { get } = require('axios'),
	Command = require('../../structures/Command.js');

/**
 * Docs command
 * @extends {Command}
*/
class Docs extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'docs',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays Discord.js documentation.',
			usage: 'docs <query>',
			cooldown: 3000,
			examples: ['docs channel#create'],
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Make sure something is entered to search on djs website
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/docs:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Get docs information
		get(`https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(message.args.join(' '))}`)
			.then(({ data }) => {
			// Display discord.js docs (if any)
				if (data && !data.error) {
					message.channel.send({ embeds: [data] });
				} else {
					message.channel.error('host/docs:MISSING');
				}
			}).catch(err => {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			});
	}
}

module.exports = Docs;
