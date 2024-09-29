import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message } from 'discord.js';
import { fetchFromAPI } from '../../utils';

/**
 * 4k command
 * @extends {Command}
*/
export default class NSFW extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'nsfw',
			nsfw: true,
			dirname: __dirname,
			description: 'Look at NSFW images.',
			usage: '4k',
			cooldown: 2000,
			slash: true,
			options: [{
				name: 'type',
				description: 'Type of image',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: ['hentai', 'ass', 'pgif', 'thigh', 'hass', 'boobs', 'hboobs', 'lewdneko', 'feet', 'hyuri', 'hthigh', 'anal', 'blowjob', 'gonewild', '4k', 'kanna', 'hentai_anal', 'neko'].map(i => ({ name: i, value: i })),
			}],
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		try {
			const image = await fetchFromAPI('nsfw/image', { type: message.args[0] });
			const embed = new EgglordEmbed(client, message.guild)
				.setImage(image);
			message.channel.send({ embeds: [embed] });
		} catch (err: any) {
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			message.channel.send({ embeds: [embed] });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		try {
			const image = await fetchFromAPI('nsfw/image', { type: interaction.options.getString('type', true) });
			if (image.error) throw new Error(image.error);

			const embed = new EgglordEmbed(client, interaction.guild)
				.setImage(image);
			interaction.reply({ embeds: [embed] });
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}
}

