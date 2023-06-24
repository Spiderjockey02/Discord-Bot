// Dependencies
const { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Addrole command
 * @extends {Command}
*/
class Role extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'role',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['createrole'],
			userPermissions: [Flags.ManageRoles],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageRoles],
			description: 'Adds a new role to the server',
			usage: 'role <role name> [hex color] [hoist]',
			cooldown: 5000,
			examples: ['addrole Test #FF0000 true'],
			slash: true,
			options: bot.subCommands.filter(c => c.help.name.startsWith('role-')).map(c => ({
				name: c.help.name.replace('role-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})),
		});
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const command = bot.subCommands.get(`role-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(bot, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}

module.exports = Role;
