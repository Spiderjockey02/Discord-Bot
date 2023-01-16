// Dependencies
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Dashboard command
 * @extends {Command}
*/
class Dashboard extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'dashboard',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['db'],
			description: 'Sends a link to your Server\'s dashboard.',
			usage: 'dashboard',
			cooldown: 2000,
			slash: true,
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Access the dashboard')
					.setStyle(ButtonStyle.Link)
					.setURL(`${bot.config.websiteURL}/dashboard/${message.guild.id}`),
			);
		message.channel.send({ content: 'There you go.', components: [row] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Access the dashboard')
					.setStyle(ButtonStyle.Link)
					.setURL(`${bot.config.websiteURL}/dashboard/${guild.id}`),
			);
		interaction.reply({ content: 'There you go.', components: [row] });
	}
}

module.exports = Dashboard;
