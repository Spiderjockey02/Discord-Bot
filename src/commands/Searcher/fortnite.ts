import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Guild, Message } from 'discord.js';
import { fetchFromAPI } from '../../utils';

/**
 * Fortnite command
 * @extends {Command}
*/
export default class Fortnite extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {Commandfortnite} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'fortnite',
			dirname: __dirname,
			aliases: ['fort', 'fortnight'],
			description: 'Get information on a Fortnite account.',
			usage: 'fortnite <kbm / gamepad / touch> <user>',
			cooldown: 3000,
			examples: ['fortnite kbm ninja'],
			slash: true,
			options: [{
				name: 'device',
				description: 'Device type',
				type: ApplicationCommandOptionType.String,
				choices: [...['kbm', 'gamepad', 'touch'].map(i => ({ name: i, value: i }))],
				required: true,
			},
			{
				name: 'username',
				description: 'username of fortnite account.',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		// Get platform and user
		const platform = message.args.shift() as string,
			username = message.args.join(' ');


		// Fetch fornite account information
		try {
			const embed = await this.createEmbed(client, message.guild, username, platform);
			message.channel.send({ embeds: [embed] });
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			message.channel.send({ embeds: [embed] });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const	username = interaction.options.getString('username', true),
			platform = interaction.options.getString('device', true);

		// send embed
		const embed = await this.createEmbed(client, interaction.guild, username, platform);
		interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for fetching/creating fornite embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {channel} channel The channel the command was ran in
	 * @param {string} username The username to search
	 * @param {string} platform The platform to search the user on
 	 * @returns {embed}
	*/
	async createEmbed(client: EgglordClient, guild: Guild | null, username: string, platform: string) {
		try {
			const fortnite = await fetchFromAPI('games/fortnite', { username, platform });
			// Check for error
			if (fortnite.error) throw new Error(fortnite.error);

			return new EgglordEmbed(client, guild)
				.setTitle('searcher/fortnite:TITLE', { USER: fortnite.username })
				.setURL(fortnite.url)
				.setDescription(
					client.languageManager.translate(guild, 'searcher/fortnite:DESC', { TOP_3: fortnite.stats.lifetime.top_3, TOP_5: fortnite.stats.lifetime.top_5, TOP_6: fortnite.stats.lifetime.top_6, TOP_12: fortnite.stats.lifetime.top_12, TOP_25: fortnite.stats.lifetime.top_25 }))
				.setThumbnail('https://vignette.wikia.nocookie.net/fortnite/images/d/d8/Icon_Founders_Badge.png')
				.addFields(
					{ name: client.languageManager.translate(guild, 'searcher/fortnite:TOTAL'), value: (fortnite.stats.solo.score + fortnite.stats.duo.score + fortnite.stats.squad.score), inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/fortnite:PLAYED'), value: fortnite.stats.lifetime.matches, inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/fortnite:WINS'), value: fortnite.stats.lifetime.wins, inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/fortnite:WINS_PRE'), value: `${((fortnite.stats.lifetime.wins / fortnite.stats.lifetime.matches) * 100).toFixed(2)}%`, inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/fortnite:KILLS'), value: `${fortnite.stats.lifetime.kills}`, inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/fortnite:K/D'), value: `${fortnite.stats.lifetime.kd}`, inline: true },
				);
		} catch (err: any) {
			client.logger.error(err.message);

			return new ErrorEmbed(client, guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}
}

