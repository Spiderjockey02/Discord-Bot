import EgglordClient from 'base/Egglord';
import Command from '../../structures/Command';
import { ApplicationCommandOptionData, ApplicationCommandOptionType, ChatInputCommandInteraction, Message } from 'discord.js';

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
			name: 'reload',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Reloads a command.',
			usage: 'reload <command / event>',
			cooldown: 3000,
			examples: ['reload help', 'reload channelCreate'],
			slash: true,
			options: client.commandManager.subCommands.filter(c => c.help.name.startsWith('reload') && c.help.name != 'reload').map(c => ({
				name: c.help.name.replace('reload-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})) as ApplicationCommandOptionData[],
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		const command = client.commandManager.get(`reload-${message.args[0]}`);
		if (command) {
			command.run(client, message);
		} else {
			message.channel.send({ content: 'error' });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const command = client.commandManager.get(`reload-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(client, interaction);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}

