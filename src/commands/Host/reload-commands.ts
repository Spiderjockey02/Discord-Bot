import EgglordClient from 'base/Egglord';
import { Command, ErrorEmbed, SuccessEmbed } from '../../structures';
import { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, Message } from 'discord.js';

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
			name: 'reload-commands',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Reloads a command.',
			usage: 'reload command',
			cooldown: 3000,
			examples: ['reload help'],
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'command',
				description: 'Command to reload',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			}],
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		// checks to make sure command exists
		const commandName = message.args[0].toLowerCase();
		const cmd = client.commandManager.get(commandName);

		if (cmd !== undefined) {
			// reloads command
			try {
				cmd.unload();
				await cmd.load(client);

				const embed = new SuccessEmbed(client, message.guild)
					.setMessage('host/reload:SUCCESS', { NAME: cmd.help.name });
				message.channel.send({ embeds: [embed] });
			} catch (err: any) {
				client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

				const embed = new ErrorEmbed(client, message.guild)
					.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
				message.channel.send({ embeds: [embed] });
			}
		} else {
			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('host/reload:INCORRECT_DETAILS', { NAME: commandName });
			message.channel.send({ embeds: [embed] });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const cmdName = interaction.options.getString('command', true);

		// Find apparent command
		const cmd = client.commandManager.get(cmdName);
		if (cmd) {
			// reloads command
			try {
				cmd.unload();
				await cmd.load(client);

				const embed = new SuccessEmbed(client, interaction.guild)
					.setMessage('host/reload:SUCCESS', { NAME: cmdName });
				interaction.reply({ embeds: [embed] });
			} catch (err: any) {
				client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

				const embed = new ErrorEmbed(client, interaction.guild)
					.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
				interaction.reply({ embeds: [embed], ephemeral: true });
			}
		} else {
			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('host/reload:INCORRECT_DETAILS', { NAME: cmdName });
			interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}

	/**
	 * Function for handling autocomplete
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @readonly
	*/
	async autocomplete(client: EgglordClient, interaction: AutocompleteInteraction) {
		const cmds = client.commandManager.allNames().sort(),
			input = interaction.options.getFocused(true).value;
		const selectedEvents = cmds.filter(i => i.toLowerCase().startsWith(input)).slice(0, 10);

		interaction.respond(selectedEvents.map(i => ({ name: i, value: i })));
	}
}

