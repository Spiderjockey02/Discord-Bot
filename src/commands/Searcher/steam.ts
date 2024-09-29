import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Guild, Message } from 'discord.js';
import { fetchFromAPI } from '../../utils';

/**
 * Steam command
 * @extends {Command}
*/
export default class Steam extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'steam',
			dirname: __dirname,
			description: 'Get information on a Steam account.',
			usage: 'steam <user>',
			cooldown: 3000,
			examples: ['steam spiderjockey02', 'steam eroticgaben'],
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

		const resp = await this.fetchSteamData(client, message.guild, message.args.join(' '));
		message.channel.send({ embeds: [resp] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const username = interaction.options.getString('username', true);

		// fetch steam account
		const resp = await this.fetchSteamData(client, interaction.guild, username);
		interaction.reply({ embeds: [resp] });
	}

	/**
	 * Function for fetching/creating instagram embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {channel} channel The channel the command was ran in
	 * @param {string} token API token to interact with steam API
	 * @param {string} username The username to search
	 * @returns {embed}
	*/
	async fetchSteamData(client: EgglordClient, guild: Guild | null, username: string) {
		try {
			const steam = await fetchFromAPI('socials/steam', { username });
			if (steam.error) throw new Error(steam.error);

			// display data
			return new EgglordEmbed(client, guild)
				.setAuthor({ name: client.languageManager.translate(guild, 'searcher/steam:AUTHOR', { NAME: steam.realname }), iconURL: steam.avatar })
				.setThumbnail(steam.avatar)
				.setDescription(client.languageManager.translate(guild, 'searcher/steam:DESC', {
					NAME: steam.realname || 'Unknown',
					STATUS: steam.status,
					FLAG: steam.countryCode ? steam.countryCode.toLowerCase() : 'white',
					TIME: `<t:${steam.createdAt}:F>`,
					GAME_BANS: steam.bans.NumberOfGameBans, VAC_BANS: steam.bans.NumberOfVACBans,
					URL: steam.url,
				}))
				.setTimestamp();
		} catch (err: any) {
			client.logger.error(err.message);

			return new ErrorEmbed(client, guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}
}

