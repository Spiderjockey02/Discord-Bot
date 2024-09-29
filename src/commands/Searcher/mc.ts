import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import { ApplicationCommandOptionType, AttachmentBuilder, ChatInputCommandInteraction, Guild, Message } from 'discord.js';
import { fetchFromAPI } from '../../utils';

/**
 * MC command
 * @extends {Command}
*/
export default class Minecraft extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'mc',
			dirname: __dirname,
			aliases: ['minecraft'],
			description: 'Pings a minecraft for information.',
			usage: 'mc <IP> [Port]',
			cooldown: 3000,
			examples: ['mc eu.hypixel.net'],
			slash: true,
			options: [{
				name: 'ip',
				description: 'IP of the Minecraft server.',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'port',
				description: 'Port of the Minecraft server.',
				type: ApplicationCommandOptionType.String,
				required: false,
			}],
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		// If no ping use 25565
		if (!message.args[1]) message.args[1] = '25565';

		// Ping server
		const { embed, attachment } = await this.createEmbed(client, message.guild, message.args[0], message.args[1]);
		message.channel.send({ embeds: [embed], files: attachment == undefined ? undefined : [attachment] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const IP = interaction.options.getString('ip', true),
			port = interaction.options.getString('port') ?? '25565';


		const { embed, attachment } = await this.createEmbed(client, interaction.guild, IP, port);
		await interaction.reply({ embeds: [embed], files: attachment == undefined ? undefined : [attachment] });
	}

	/**
	 * Function for fetching/creating instagram embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {channel} channel The channel the command was ran in
	 * @param {string} IP The IP of the server to ping
	 * @param {string} port The port that the server runs on
	 * @returns {embed}
	*/
	async createEmbed(client: EgglordClient, guild: Guild | null, IP: string, port: string) {
		try {
			const response = await fetchFromAPI('games/mc', { ip: IP, port: port });
			if (response.error) throw new Error(response.error);

			// turn favicon to thumbnail
			let attachment;
			if (response.favicon) {
				const imageStream = Buffer.from(response.favicon.split(',').slice(1).join(','), 'base64');
				attachment = new AttachmentBuilder(imageStream, { name: 'favicon.png' });
			}

			const embed = new EgglordEmbed(client, guild)
				.setTitle('searcher/mc:TITLE');
			if (response.favicon) embed.setThumbnail('attachment://favicon.png');
			embed.setURL(`https://mcsrvstat.us/server/${IP}:${port}`)
				.addFields(
					{ name:client.languageManager.translate(guild, 'searcher/mc:PING'), value: `${response.roundTripLatency}ms` },
					{ name:client.languageManager.translate(guild, 'searcher/mc:VERSION'), value: response.version.name },
					{ name:client.languageManager.translate(guild, 'searcher/mc:DESC'), value: response.motd.clean },
					{ name:client.languageManager.translate(guild, 'searcher/mc:PLAYERS'), value: `${response.players.online}/${response.players.max}` },
				);

			return { embed, attachment };
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return { embed: new ErrorEmbed(client, guild).setMessage('misc:ERROR_MESSAGE', { ERROR: err.message }) };
		}
	}
}

