import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Guild, Message } from 'discord.js';
import { fetchFromAPI } from '../../utils';

/**
 * Twitch command
 * @extends {Command}
*/
export default class Twitch extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'twitch',
			dirname: __dirname,
			description: 'Get information on a twitch account.',
			usage: 'twitch <user>',
			cooldown: 3000,
			examples: ['twitch ninja'],
			slash: true,
			options: [{
				name: 'username',
				description: 'Account name',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;
		const user = message.args[0];

		// fetch data
		try {
			const embed = await this.fetchTwitchData(client, message.guild, user);
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
		const user = interaction.options.getString('username', true);

		const embed = await this.fetchTwitchData(client, interaction.guild, user);
		interaction.reply({ embeds: [embed] });
	}

	async fetchTwitchData(client: EgglordClient, guild: Guild | null, username: string) {
		try {
			const twitch = await fetchFromAPI('socials/twitch', { username });
			if (twitch.error) throw new Error(twitch.error);

			const embed = new EgglordEmbed(client, guild)
				.setTitle(twitch.display_name)
				.setURL(`https://twitch.tv/${twitch.login}`)
				.setThumbnail(twitch.profile_image_url)
				.setAuthor({ name: 'Twitch', iconURL: 'https://i.imgur.com/4b9X738.png' })
				.addFields(
					{ name: client.languageManager.translate(guild, 'searcher/twitch:BIO'), value: twitch.description || client.languageManager.translate(guild, 'searcher/twitch:NO_BIO'), inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/twitch:TOTAL'), value: twitch.view_count, inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/twitch:FOLLOWERS'), value: twitch.followers, inline: true },
				);

			if (twitch.steaming) {
				embed
					.addFields({ name: '\u200B', value: client.languageManager.translate(guild, 'searcher/twitch:STREAMING', { TITLE: twitch.steaming.title, NUM: twitch.steaming.viewer_count }) })
					.setImage(twitch.steaming.thumbnail_url.replace('{width}', 1920).replace('{height}', 1080));
			}
			return embed;
		} catch (err: any) {
			client.logger.error(err.message);

			return new ErrorEmbed(client, guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}
}

