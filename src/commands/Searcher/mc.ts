// Dependencies
const	{ AttachmentBuilder, ApplicationCommandOptionType } = require('discord.js'),
	{ Embed } = require('../../utils'), ;
import Command from '../../structures/Command';

/**
 * MC command
 * @extends {Command}
*/
export default class Minecraft extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
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

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(client, message, settings) {
		// Ping a minecraft server
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/mc:USAGE')) });

		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(message.translate('searcher/mc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '', ITEM: this.help.name }));

		// If no ping use 25565
		if (!message.args[1]) message.args[1] = '25565';

		// Ping server
		const resp = await this.createEmbed(client, message.guild, message.channel, message.args[0], message.args[1]);
		msg.delete();
		if (Array.isArray(resp)) {
			await message.channel.send({ embeds: [resp[0]], files: [resp[1]] });
		} else {
			await message.channel.send({ embeds: [resp] });
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			IP = args.get('ip').value,
			port = args.get('port')?.value ?? 25565;

		await interaction.reply({ content: guild.translate('misc:FETCHING', {	EMOJI: client.customEmojis['loading'], ITEM: 'Image' }) });

		try {
			const resp = await this.createEmbed(client, guild, channel, IP, port);
			if (Array.isArray(resp)) {
				await interaction.editReply({ content: ' ', embeds: [resp[0]], files: [resp[1]] });
			} else {
				await interaction.editReply({ content: ' ', embeds: [resp] });
			}
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
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
	async createEmbed(client, guild, channel, IP, port) {
		try {
			const response = await client.fetch('games/mc', { ip: IP, port: port });
			if (response.error) throw new Error(response.error);

			// turn favicon to thumbnail
			let attachment;
			if (response.favicon) {
				const imageStream = Buffer.from(response.favicon.split(',').slice(1).join(','), 'base64');
				attachment = new AttachmentBuilder(imageStream, { name: 'favicon.png' });
			}

			const embed = new Embed(client, guild)
				.setColor(0x0099ff)
				.setTitle('searcher/mc:TITLE');
			if (response.favicon) embed.setThumbnail('attachment://favicon.png');
			embed.setURL(`https://mcsrvstat.us/server/${IP}:${port}`)
				.addFields(
					{ name: guild.translate('searcher/mc:PING'), value: `${response.roundTripLatency}ms` },
					{ name: guild.translate('searcher/mc:VERSION'), value: response.version.name },
					{ name: guild.translate('searcher/mc:DESC'), value: response.motd.clean },
					{ name: guild.translate('searcher/mc:PLAYERS'), value: `${response.players.online.toLocaleString(guild.settings.Language)}/${response.players.max.toLocaleString(guild.settings.Language)}` },
				);

			if (response.favicon) {
				return [embed, attachment];
			} else {
				return embed;
			}
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}
	}
}

