// Dependencies
const import Command from '../../structures/Command';,
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js');

/**
 * Reaction role add command
 * @extends {Command}
*/
export default class ReactionRole extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'reaction-roles',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['reactionRole'],
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions, Flags.ManageRoles],
			description: 'Create a reaction role',
			usage: 'rr-add [channelID / message link]',
			cooldown: 5000,
			examples: ['rr-add 3784484	8481818441'],
			slash: true,
			options: client.subCommands.filter(c => ['rr-add', 'rr-remove'].includes(c.help.name)).map(c => ({
				name: c.help.name.replace('rr-', ''),
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
 	 * @returns {embed}
	*/
	async callback(client, interaction, guild, args) {
		console.log(interaction.options);
		const command = client.subCommands.get(`rr-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(client, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}


