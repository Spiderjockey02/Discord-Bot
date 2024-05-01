// Dependencies
const { promisify } = require('util'),
	readdir = promisify(require('fs').readdir),
	path = require('path'),
	{ ApplicationCommandOptionType } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Reload command
 * @extends {Command}
*/
export default class Reload extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'reload',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Reloads a command.',
			usage: 'reload <command / event>',
			cooldown: 3000,
			examples: ['reload help', 'reload channelCreate'],
			slash: true,
			options: client.subCommands.filter(c => c.help.name.startsWith('reload') && c.help.name != 'reload').map(c => ({
				name: c.help.name.replace('reload-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})),
		});
	}

	/**
	 * Function for receiving message.
	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(client, message, settings) {
		// delete message
		if (message.deletable) message.delete();

		// Checks to see if a command was specified
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/reload:USAGE')) });

		// checks to make sure command exists
		const commandName = message.args[0].toLowerCase();
		if (client.commands.has(commandName) || client.commands.get(client.aliases.get(commandName))) {
			// Finds command
			const cmd = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));

			// reloads command
			try {
				await client.unloadCommand(cmd.conf.location, cmd.help.name);
				await client.loadCommand(cmd.conf.location, cmd.help.name);
				return message.channel.success('host/reload:SUCCESS', { NAME: commandName }).then(m => m.timedDelete({ timeout: 8000 }));
			} catch (err) {
				client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				if (message.deletable) message.delete();
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else if (Object.keys(client._events).includes(message.args[0])) {
			try {
				// locate file
				let fileDirectory;
				const evtFolder = await readdir('./src/events/');
				evtFolder.forEach(async folder => {
					const folders = await readdir('./src/events/' + folder + '/');
					folders.forEach(async file => {
						const { name } = path.parse(file);
						if (name == message.args[0]) {
							fileDirectory = `../../events/${folder}/${file}`;
							delete require.cache[require.resolve(fileDirectory)];
							client.removeAllListeners(message.args[0]);
							const event = new (require(fileDirectory))(client, message.args[0]);
							client.logger.log(`Loading Event: ${message.args[0]}`);
							// eslint-disable-next-line no-shadow
							client.on(message.args[0], (...args) => event.run(client, ...args));
							return message.channel.success('host/reload:SUCCESS_EVENT', { NAME: message.args[0] }).then(m => m.timedDelete({ timeout: 8000 }));
						}
					});
				});
			} catch (err) {
				client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else {
			return message.channel.error('host/reload:INCORRECT_DETAILS', { NAME: commandName });
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const command = client.subCommands.get(`reload-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(client, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}

