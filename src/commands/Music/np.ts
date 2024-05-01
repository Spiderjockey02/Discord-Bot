// Dependencies
const { Embed } = require('../../utils'),
	{ splitBar } = require('string-progressbar'), ;
import Command from '../../structures/Command';

/**
 * NowPlaying command
 * @extends {Command}
*/
export default class NowPlaying extends Command {
	/**
	 * @param {Client} client The instantiating client
	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'np',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['song'],
			description: 'Shows the current song playing.',
			usage: 'np',
			cooldown: 3000,
			slash: true,
		});
	}

	/**
	 * Function for receiving message.
	 * @param {client} client The instantiating client
	 * @param {message} message The message that ran the command
	 * @readonly
		*/
	async run(client, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE');
			}
		}

		// Check that a song is being played
		const player = client.manager?.players.get(message.guild.id);
		if (!player || !player.queue.current) return message.channel.error('music/misc:NO_QUEUE');

		// Get current song information
		const { title, requester, thumbnail, uri, duration } = player.queue.current;
		const end = (duration > 6.048e+8) ? message.translate('music/np:LIVE') : new Date(duration).toISOString().slice(11, 19);
		// Display current song information
		try {
			const embed = new Embed(client, message.guild)
				.setAuthor({ name: message.translate('music/np:AUTHOR') })
				.setColor(message.member.displayHexColor)
				.setThumbnail(thumbnail)
				.setDescription(`[${title}](${uri}) [${message.guild.members.cache.get(requester.id)}]`)
				.addFields(
					{ name: '\u200b', value: new Date(player.position * (player.filters.timescale?.speed ?? 1)).toISOString().slice(11, 19) + ' [' + splitBar(duration > 6.048e+8 ? player.position * (player.filters.timescale?.speed ?? 1) : duration, player.position * (player.filters.timescale?.speed ?? 1), 15)[0] + '] ' + end },
				);
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(client, interaction, guild) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		// Check if the member has role to interact with music plugin
		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { ERROR: null }, true)] });
			}
		}

		// Check that a song is being played
		const player = client.manager?.players.get(guild.id);
		if (!player) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/misc:NO_QUEUE', { ERROR: null }, true)] });

		// Get current song information
		const { title, requester, thumbnail, uri, duration } = player.queue.current;
		const end = (duration > 6.048e+8) ? client.translate('music/np:LIVE') : new Date(duration).toISOString().slice(11, 19);
		// Display current song information
		try {
			const embed = new Embed(client, guild)
				.setAuthor({ name: client.translate('music/np:AUTHOR') })
				.setColor(member.displayHexColor)
				.setThumbnail(thumbnail)
				.setDescription(`[${title}](${uri}) [${guild.members.cache.get(requester.id)}]`)
				.addFields(
					{ name: '\u200b', value: new Date(player.position * (player.filters.timescale?.speed ?? 1)).toISOString().slice(11, 19) + ' [' + splitBar(duration > 6.048e+8 ? player.position * (player.filters.timescale?.speed ?? 1) : duration, player.position * (player.filters.timescale?.speed ?? 1), 15)[0] + '] ' + end },
				);
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: null }, true)] });
		}
	}
}

