// Dependencies
const { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Bassboost command
 * @extends {Command}
*/
class Bassboost extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'effects',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Bassboost the song',
			usage: 'bassboost [value]',
			cooldown: 3000,
			examples: ['bb 8', 'bb'],
			slash: true,
			options: bot.commands.filter(c => c.help.name.startsWith('effects-')).map(c => ({
				name: c.help.name.replace('effects-', ''),
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
		const command = bot.commands.get(`effects-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(bot, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}

module.exports = Bassboost;
