// Dependencies
const Command = require('../../structures/Command.js'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js');

/**
 * Reaction role add command
 * @extends {Command}
*/
class ReactionRole extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
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
			options: bot.subCommands.filter(c => ['rr-add', 'rr-remove'].includes(c.help.name)).map(c => ({
				name: c.help.name.replace('rr-', ''),
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
 	 * @param {args} args The options provided in the command, if any
 	 * @returns {embed}
	*/
	async callback(bot, interaction, guild, args) {
		console.log(interaction.options);
		const command = bot.subCommands.get(`rr-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(bot, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}

module.exports = ReactionRole;
