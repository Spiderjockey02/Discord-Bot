// Dependencies
const { Embed } = require('../../utils'), ;
import Command from '../../structures/Command';

/**
 * Status command
 * @extends {Command}
*/
export default class Status extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'status',
			dirname: __dirname,
			aliases: ['stat', 'ping'],
			description: 'Gets the status of the client.',
			usage: 'status',
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
		// Get information on the services the client provide
		const m = await message.channel.send(message.translate('misc/status:PONG'));

		const embed = new Embed(client, message.guild)
			.addFields(
				{ name: client.translate('misc/status:PING'), value: `\`${m.createdTimestamp - message.createdTimestamp}ms\``, inline: true },
				{ name: client.translate('misc/status:CLIENT'), value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
				{ name: client.translate('misc/status:MONGO'), value:  `\`${Math.round(await client.mongoose.ping())}ms\``, inline: true },
			)
			.setTimestamp();
		await message.channel.send({ embeds: [embed] });
		m.delete();
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(client, interaction, guild) {
		const msg = await interaction.reply({ content: guild.translate('misc/status:PONG'), fetchReply: true });

		const embed = new Embed(client, guild)
			.addFields(
				{ name: client.translate('misc/status:PING'), value: `\`${msg.createdTimestamp - interaction.createdTimestamp}ms\``, inline: true },
				{ name: client.translate('misc/status:CLIENT'), value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
				{ name: client.translate('misc/status:MONGO'), value:  `\`${Math.round(await client.mongoose.ping())}ms\``, inline: true },
			)
			.setTimestamp();
		await interaction.editReply({ content: '‎', embeds: [embed] });
	}
}

