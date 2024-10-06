import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command, ErrorEmbed, SuccessEmbed } from '../../structures';
import EgglordClient from 'base/Egglord';
import { Node } from 'magmastream';

/**
 * Lavalink command
 * @extends {Command}
*/
export default class LavalinkAdd extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'lavalink-add',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Interact with the Lavalink nodes',
			usage: 'lavalink [list | add | remove] <information>',
			cooldown: 3000,
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'host',
				description: 'The lhost',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'password',
				description: 'The password',
				type: ApplicationCommandOptionType.String,
				required: false,
			},
			{
				name: 'port',
				description: 'The port',
				type: ApplicationCommandOptionType.Integer,
				required: false,
			}],
		});
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const host = interaction.options.getString('host', true),
			password = interaction.options.getString('password') ?? 'youshallnotpass',
			port = interaction.options.getInteger('port') ?? 5000;

		try {
			// Connect to new node
			await (new Node({
				host, password, port,
			})).connect();

			const embed = new SuccessEmbed(client, interaction.guild)
				.setMessage('host/node:ADDED_NODE');
			interaction.reply({ embeds: [embed] });
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			interaction.reply({ embeds: [embed] });
		}
	}
}

