// Dependencies
const { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Giveaway start command
 * @extends {Command}
*/
class Giveaway extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'giveaway',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
			description: 'Start a giveaway',
			usage: 'g-start <time> <Number of winners> <prize>',
			cooldown: 30000,
			examples: ['g-start 1m 1 nitro', 'g-start 2h30m 3 nitro classic'],
			slash: true,
			options: bot.commands.filter(c => c.help.category == 'Giveaway').map(c => ({
				name: c.help.name,
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
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const command = bot.commands.get(`g-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(bot, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error' });
		}
	}
}

module.exports = Giveaway;
