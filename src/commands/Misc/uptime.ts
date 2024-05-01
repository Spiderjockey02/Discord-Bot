// Dependencies
const { Embed, time: { getReadableTime } } = require('../../utils'), ;
import Command from '../../structures/Command';

/**
 * Uptime command
 * @extends {Command}
*/
export default class Uptime extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'uptime',
			dirname: __dirname,
			description: 'Gets the uptime of the client.',
			usage: 'uptime',
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
		const embed = new Embed(client, message.guild)
			.setDescription(message.translate('misc/uptime:DESC', { TIME: getReadableTime(client.uptime) }));
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(client, interaction, guild) {
		const embed = new Embed(client, guild)
			.setDescription(guild.translate('misc/uptime:DESC', { TIME: getReadableTime(client.uptime) }));
		return interaction.reply({ embeds: [embed] });
	}
}

