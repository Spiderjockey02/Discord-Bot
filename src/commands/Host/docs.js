// Dependencies
const { get } = require('axios'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
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
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Displays Discord.js documentation.',
			usage: 'docs <query>',
			cooldown: 3000,
			examples: ['docs channel#create'],
			slash: false,
			options: [{
				name: 'input',
				description: 'Search in the discordjs docs',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			}],
		});
	}

	/**
	 * Function for receiving message.
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

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction) {
		interaction.reply({ content: 'This is currently unavailable.' });
	}
}

module.exports = Docs;
