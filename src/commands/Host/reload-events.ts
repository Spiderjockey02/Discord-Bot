import EgglordClient from 'base/Egglord';
import { Command, ErrorEmbed, Event, SuccessEmbed } from '../../structures';
import { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import { readdir } from 'fs/promises';
import path from 'path';

/**
 * Reload command
 * @extends {Command}
*/
export default class Reload extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
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

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const evtName = interaction.options.getString('event', true);
		if (client.eventNames().includes(evtName)) {
			try {
				// locate file
				let fileDirectory;
				const evtFolder = await readdir('./src/events/');
				for (const folder of evtFolder) {
					const folders = await readdir('./src/events/' + folder + '/');
					for (const file of folders) {
						const { name } = path.parse(file);
						if (name == evtName) {
							fileDirectory = `../../events/${folder}/${evtName}`;
							delete require.cache[require.resolve(fileDirectory)];
							client.removeAllListeners(evtName);

							const eventFile = (await import(`${process.cwd()}/dist/events/${folder}/${evtName}`)).default;
							const evt = new eventFile() as Event;

							client.logger.log(`Reloading Event: ${evtName}`);
							if (evt.conf.child == undefined) client.on(evt.conf.name, (...args) => evt.run(client, ...args));
							switch (evt.conf.child) {
								case 'audioManager':
									client.audioManager?.on(evt.conf.name, (...args) => evt.run(client, ...args));
									break;
							}
							const embed = new SuccessEmbed(client, interaction.guild)
								.setMessage('host/reload:SUCCESS_EVENT', { NAME: evtName });
							return interaction.reply({ embeds: [embed] });
						}
					}
				}
			} catch (err: any) {
				client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				const embed = new ErrorEmbed(client, interaction.guild)
					.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
		} else {
			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage(`${evtName} is not an event`);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}

	/**
	 * Function for handling autocomplete
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @readonly
	*/
	async autocomplete(client: EgglordClient, interaction: AutocompleteInteraction) {
		const events = [...client.eventNames().map(s => String(s))].sort(),
			input = interaction.options.getFocused(true).value;

		const selectedEvents = events.filter(i => i.toLowerCase().startsWith(input)).slice(0, 10);
		interaction.respond(selectedEvents.map(i => ({ name: i, value: i })));
	}
}

