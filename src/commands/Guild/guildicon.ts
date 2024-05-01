// Dependencies
const { Embed } = require('../../utils'),
	{ AttachmentBuilder } = require('discord.js'),
	{ Canvas } = require('canvacord'), ;
import Command from '../../structures/Command';

/**
 * Guildicon command
 * @extends {Command}
*/
export default class Guildicon extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor() {
		super({
			name:  'guildicon',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['servericon'],
			description: 'Get the server\'s icon.',
			usage: 'guildicon',
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
		// Check for guild icon & send message
		const embed = new Embed(client, message.guild)
			.setDescription(message.translate('guild/guildicon:ICON', { URL: message.guild.iconURL({ dynamic: true, size: 1024 }) }));

		if (message.guild.icon == null) {
			const icon = await Canvas.guildIcon(message.guild.name, 128);
			const attachment = new AttachmentBuilder(icon, { name: 'guildicon.png' });
			embed.setImage('attachment://guildicon.png');
			message.channel.send({ embeds: [embed], files: [attachment] });
		} else {
			embed.setImage(message.guild.iconURL({ dynamic: true, size: 1024 }));
			message.channel.send({ embeds: [embed] });
		}
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
			.setDescription(guild.translate('guild/guildicon:ICON', { URL: guild.iconURL({ dynamic: true, size: 1024 }) }));

		if (guild.icon == null) {
			const icon = await Canvas.guildIcon(guild.name, 128);
			const attachment = new AttachmentBuilder(icon, { name: 'guildicon.png' });
			embed.setImage('attachment://guildicon.png');
			interaction.reply({ embeds: [embed], files: [attachment] });
		} else {
			embed.setImage(guild.iconURL({ dynamic: true, size: 1024 }));
			interaction.reply({ embeds: [embed] });
		}
	}
}

