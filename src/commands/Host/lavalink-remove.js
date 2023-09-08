// Dependencies
const	{ ApplicationCommandOptionType } = require('discord.js'),
	{ Node } = require('magmastream'),
	Command = require('../../structures/Command.js');

/**
 * Lavalink command
 * @extends {Command}
*/
class LavalinkRemove extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
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
   * @param {bot} bot The instantiating client
   * @param {interaction} interaction The interaction that ran the command
   * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
   * @readonly
  */
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			host = args.get('host')?.value ?? 'localhost',
			password = args.get('password')?.value ?? 'youshallnotpass',
			port = args.get('port')?.value ?? 5000;

		try {
			await (new Node({
				host, password, port,
			})).destroy();
			interaction.reply({ embeds: [channel.success('host/node:REMOVED_NODE', null, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

module.exports = LavalinkRemove;
