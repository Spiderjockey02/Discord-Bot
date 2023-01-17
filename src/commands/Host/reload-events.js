// Dependencies
const { promisify } = require('util'),
	readdir = promisify(require('fs').readdir),
	path = require('path'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Reload command
 * @extends {Command}
*/
class Reload extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'reload-events',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Reloads an event.',
			usage: 'reload command',
			cooldown: 3000,
			examples: ['reload help'],
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'event',
				description: 'Event to reload',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			}],
		});
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const evtName = args.get('event').value,
			channel = guild.channels.cache.get(interaction.channelId);

		if (Object.keys(bot._events).includes(evtName)) {
			try {
				// locate file
				let fileDirectory;
				const evtFolder = await readdir('./src/events/');
				for (const folder of evtFolder) {
					const folders = await readdir('./src/events/' + folder + '/');
					for (const file of folders) {
						const { name } = path.parse(file);
						if (name == evtName) {
							fileDirectory = `../../events/${folder}/${file}`;
							delete require.cache[require.resolve(fileDirectory)];
							bot.removeAllListeners(evtName);
							const event = new (require(fileDirectory))(bot, evtName);
							bot.logger.log(`Reloading Event: ${evtName}`);
							// eslint-disable-next-line no-shadow
							bot.on(evtName, (...args) => event.run(bot, ...args));
							return interaction.reply({ embeds: [channel.success('host/reload:SUCCESS_EVENT', { NAME: evtName }, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 8000 }));
						}
					}
				}
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
			}
		} else {
			return interaction.reply({ embeds: [channel.error(`${evtName} is not an event`, null, true)], ephemeral: true });
		}
	}

	/**
	 * Function for handling autocomplete
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @readonly
	*/
	async autocomplete(bot, interaction) {
		const events = Object.keys(bot._events).sort(),
			input = interaction.options.getFocused(true).value;
		const selectedEvents = events.filter(i => i.toLowerCase().startsWith(input)).slice(0, 10);

		interaction.respond(selectedEvents.map(i => ({ name: i, value: i })));
	}
}

module.exports = Reload;
