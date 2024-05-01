import EgglordClient from 'src/base/Egglord';
import Command from 'src/structures/Command';
import { CommandInteraction, Guild, Message } from 'discord.js';

/**
 * Flip command
 * @extends {Command}
*/
export default class Flip extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'flip',
			dirname: __dirname,
			description: 'Flip a coin.',
			usage: 'flip',
			cooldown: 1000,
			slash: true,
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(client: EgglordClient, message: Message<true>) {
		const num = Math.round(Math.random()),
			emoji = message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis[['head', 'tail'][num]] : '',
			result = message.translate(`fun/flip:${num < 0.5 ? 'HEADS' : 'TAILS'}`);

		// send result
		message.channel.send({ content: `${emoji} ${result}` });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(client: EgglordClient, interaction: CommandInteraction, guild: Guild) {
		const channel = guild.channels.cache.get(interaction.channelId),
			num = Math.round(Math.random()),
			emoji = channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis[['head', 'tail'][num]] : '',
			result = guild.translate(`fun/flip:${num < 0.5 ? 'HEADS' : 'TAILS'}`);

		// send result
		return interaction.reply({ content: `${emoji} ${result}` });
	}
}