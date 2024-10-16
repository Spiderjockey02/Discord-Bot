import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed } from '../../structures';
import { ChatInputCommandInteraction, Message } from 'discord.js';

/**
 * Status command
 * @extends {Command}
*/
export default class Status extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'status',
			dirname: __dirname,
			aliases: ['stat', 'ping'],
			description: 'Gets the status of the client.',
			usage: 'status',
			cooldown: 2000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		// Get information on the services the client provide
		const msg = await message.channel.send(client.languageManager.translate(message.guild, 'misc/status:PONG'));

		const embed = new EgglordEmbed(client, message.guild)
			.addFields(
				{ name: 'misc/status:PING', value: `\`${msg.createdTimestamp - message.createdTimestamp}ms\``, inline: true },
				{ name: 'misc/status:CLIENT', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
				// { name: 'misc/status:MONGO', value:  `\`${Math.round(await client.mongoose.ping())}ms\``, inline: true },
			)
			.setTimestamp();
		await message.channel.send({ embeds: [embed] });
		msg.delete();
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const msg = await interaction.reply({ content: client.languageManager.translate(interaction.guild, 'misc/status:PONG'), fetchReply: true });

		const embed = new EgglordEmbed(client, interaction.guild)
			.addFields(
				{ name: 'misc/status:PING', value: `\`${msg.createdTimestamp - msg.createdTimestamp}ms\``, inline: true },
				{ name: 'misc/status:CLIENT', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
				// { name: 'misc/status:MONGO', value:  `\`${Math.round(await client.mongoose.ping())}ms\``, inline: true },
			)
			.setTimestamp();
		await interaction.editReply({ content: '‎', embeds: [embed] });
	}
}

