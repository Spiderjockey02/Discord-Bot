import { ApplicationCommandOptionType, ChatInputCommandInteraction, Guild, Message } from 'discord.js';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import EgglordClient from 'base/Egglord';
import { fetchFromAPI } from '../../utils';

/**
 * R6 command
 * @extends {Command}
*/
export default class Rainbow6Siege extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'r6',
			dirname: __dirname,
			description: 'Gets statistics on a Rainbow 6 Account.',
			usage: 'r6 <user> [pc / xbox / ps4] [eu / na / as]',
			cooldown: 3000,
			examples: ['r6 ThatGingerGuy02', 'r6 ThatGingerGuy02 pc eu'],
			slash: true,
			options: [{
				name: 'username',
				description: 'account name',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'platform',
				description: 'Device of user.',
				type: ApplicationCommandOptionType.String,
				choices: [...['uplay', 'xbl', 'psn'].map(i => ({ name: i, value: i }))],
				required: false,
			},
			{
				name: 'region',
				description: 'Region of user.',
				type: ApplicationCommandOptionType.String,
				choices: [...['eu', 'na', 'as'].map(i => ({ name: i, value: i }))],
				required: false,
			}],
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		// display stats
		const resp = await this.fetchUserData(client, message.guild, message.args[0], message.args[1], message.args[2]);
		message.channel.send({ embeds: [resp] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const username = interaction.options.getString('username', true),
			platform = interaction.options.getString('platform') ?? 'uplay',
			region = interaction.options.getString('region') ?? 'emea';

		// display stats
		const resp = await this.fetchUserData(client, interaction.guild, username, platform, region);
		interaction.reply({ embeds: [resp] });
	}

	/**
	 * Function for fetching/creating instagram embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {string} username The player name to search
	 * @param {string} platform The platform to search the player on
	 * @param {string} region The region the player is from
	 * @returns {embed}
	*/
	async fetchUserData(client: EgglordClient, guild: Guild | null, username: string, platform: string, region: string) {
		try {
			if (platform === 'xbl') username = username.replace('_', '');
			const playerData = await fetchFromAPI('games/r6', { username, platform, region });
			if (playerData.error) throw new Error(playerData.error);

			return new EgglordEmbed(client, guild)
				.setAuthor({ name: username, iconURL: client.user.displayAvatarURL() })
				.setDescription(client.languageManager.translate(guild, 'searcher/r6:DESC', { REGION: region.toUpperCase(), PLATFORM: platform.toUpperCase() }))
				.setThumbnail(playerData.profileURL)
				.addFields(
					{ name: client.languageManager.translate(guild, 'searcher/r6:GENERAL'), value: client.languageManager.translate(guild, 'searcher/r6:GEN_DATA', {
						LVL: playerData.level, XP: playerData.xp, NAME: playerData.rank.current.name, MAX_NAME: playerData.rank.max.name,
						MMR: playerData.rank.current.mmr }) },
					{ name: client.languageManager.translate(guild, 'searcher/r6:STATS'), value: client.languageManager.translate(guild, 'searcher/r6:STAT_DATA', {
						WIN: playerData.pvp.wins, LOSS: playerData.pvp.losses,
						WL: (playerData.pvp.wins / playerData.pvp.matches).toFixed(2), KILL: playerData.pvp.kills,
						DEATH: playerData.pvp.deaths, KD: (playerData.pvp.kills / playerData.pvp.deaths).toFixed(2),
						TIME: Math.round(playerData.pvp.playtime / 3600),
					}) },
					{ name: client.languageManager.translate(guild, 'searcher/r6:TERRORIST'), value: client.languageManager.translate(guild, 'searcher/r6:STAT_DATA', {
						WIN: playerData.pve.wins, LOSS: playerData.pve.losses,
						WL: (playerData.pve.wins / playerData.pve.matches).toFixed(2), KILL: playerData.pve.kills,
						DEATH: playerData.pve.deaths, KD: (playerData.pve.kills / playerData.pve.deaths).toFixed(2),
						TIME: Math.round(playerData.pve.playtime / 3600),
					}) },
				)
				.setTimestamp();
		} catch (err: any) {
			client.logger.error(err.message);

			return new ErrorEmbed(client, guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}
}

