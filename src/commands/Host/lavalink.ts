import EgglordClient from 'base/Egglord';
import Command from '../../structures/Command';
import { ApplicationCommandOptionData, ApplicationCommandOptionType, ChatInputCommandInteraction, Message } from 'discord.js';

/**
 * Lavalink command
 * @extends {Command}
*/
export default class Lavalink extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'lavalink',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Interact with the Lavalink nodes',
			usage: 'lavalink [list | add | remove] <information>',
			cooldown: 3000,
			slash: true,
			options: client.commandManager.subCommands.filter(c => c.help.name.startsWith('lavalink-')).map(c => ({
				name: c.help.name.replace('lavalink-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})) as ApplicationCommandOptionData[],
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		const command = client.commandManager.get(`lavalink-${message.args[0]}`);
		if (command) {
			command.run(client, message);
		} else {
			message.channel.send({ content: 'error' });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const command = client.commandManager.get(`lavalink-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(client, interaction);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}

