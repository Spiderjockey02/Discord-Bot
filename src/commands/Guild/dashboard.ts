// Dependencies
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Dashboard command
 * @extends {Command}
*/
export default class Dashboard extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor() {
		super({
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
	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(client, message) {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Access the dashboard')
					.setStyle(ButtonStyle.Link)
					.setURL(`${client.config.websiteURL}/dashboard/${message.guild.id}`),
			);
		message.channel.send({ content: 'There you go.', components: [row] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(client, interaction, guild) {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Access the dashboard')
					.setStyle(ButtonStyle.Link)
					.setURL(`${client.config.websiteURL}/dashboard/${guild.id}`),
			);
		interaction.reply({ content: 'There you go.', components: [row] });
	}
}

