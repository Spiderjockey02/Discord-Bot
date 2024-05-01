// Dependencies
const	{ ApplicationCommandOptionType } = require('discord.js'),
	{ Node } = require('magmastream'), ;
import Command from '../../structures/Command';

/**
 * Lavalink command
 * @extends {Command}
*/
export default class LavalinkAdd extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
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
				required: false,
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
	async callback(client, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			host = args.get('host')?.value ?? 'localhost',
			password = args.get('password')?.value ?? 'youshallnotpass',
			port = args.get('port')?.value ?? 5000;

		try {
			// Connect to new node
			await (new Node({
				host, password, port,
			})).connect();
			interaction.reply({ embeds: [channel.success('host/node:ADDED_NODE', null, true)] });
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

