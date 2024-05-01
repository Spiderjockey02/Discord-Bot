import { EgglordEmbed } from 'src/utils';
import Command from 'src/structures/Command';
import EgglordClient from 'src/base/Egglord';
import { CommandInteraction, Guild, Message } from 'discord.js';

/**
 * Fact command
 * @extends {Command}
*/
export default class Fact extends Command {
	/**
	 * @param {Client} client The instantiating client
	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'fact',
			dirname: __dirname,
			aliases: ['facts'],
			description: 'Receive a random fact.',
			usage: 'fact',
			slash: true,
			cooldown: 1000,
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(client: EgglordClient, message: Message<true>) {
		// Get the random facts file
		try {
			const fact = await client.fetch('misc/random-fact');
			const embed = new EgglordEmbed(client, message.guild)
				.setTitle('fun/fact:FACT_TITLE')
				.setDescription(fact);
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
  */
	async callback(client: EgglordClient, interaction: CommandInteraction, guild: Guild) {
		const channel = guild.channels.cache.get(interaction.channelId);

		try {
			const fact = await client.fetch('misc/random-fact');
			if (fact.error) throw new Error(fact.error);

			const embed = new Embed(client, guild)
				.setTitle('fun/fact:FACT_TITLE')
				.setDescription(fact);
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			await interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}