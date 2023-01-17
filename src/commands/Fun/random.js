// Dependencies
const { ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Random command
 * @extends {Command}
*/
class Random extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'random',
			dirname: __dirname,
			description: 'Random number or caps',
			usage: 'random',
			cooldown: 1000,
			examples: ['random'],
			slash: true,
			options: bot.commands.filter(c => c.help.name.startsWith('random') && c.help.name != 'random').map(c => ({
				name: c.help.name.replace('random-', ''),
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
		const command = bot.commands.get(`random-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(bot, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}

module.exports = Random;
