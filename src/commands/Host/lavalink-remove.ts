import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command, ErrorEmbed, SuccessEmbed } from '../../structures';
import EgglordClient from 'base/Egglord';
import { Node } from 'magmastream';

/**
 * Lavalink command
 * @extends {Command}
*/
export default class LavalinkRemove extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'lavalink-remove',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Interact with the Lavalink nodes',
			usage: 'lavalink [list | add | remove] <information>',
			cooldown: 3000,
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'host',
				description: 'The host',
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

	/**
   * Function for receiving interaction.
   * @param {client} client The instantiating client
   * @param {interaction} interaction The interaction that ran the command
   * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
   * @readonly
  */
	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const host = interaction.options.getString('host', true),
			password = interaction.options.getString('password') ?? 'youshallnotpass',
			port = interaction.options.getInteger('port') ?? 5000;

		try {
			await (new Node({
				host, password, port,
			})).destroy();

			const embed = new SuccessEmbed(client, interaction.guild)
				.setMessage('host/node:REMOVED_NODE');
			interaction.reply({ embeds: [embed] });
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			interaction.reply({ embeds: [embed] });
		}
	}
}

