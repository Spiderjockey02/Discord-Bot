// Dependencies
const { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Giveaway start command
 * @extends {Command}
*/
export default class Settings extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor() {
		super({
			name: 'settings',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
			description: 'Interact with the giveaway commands',
			usage: 'giveaway start <time> <Number of winners> <prize>',
			cooldown: 30000,
			examples: ['giveaway start 1m 1 nitro', 'giveaway reroll 1021725995901911080'],
			slash: true,
			options: client.subCommands.filter(c => c.help.name.startsWith('settings-')).map(c => ({
				name: c.help.name.replace('settings-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})),
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
		const command = client.subCommands.get(`settings-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(client, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}

