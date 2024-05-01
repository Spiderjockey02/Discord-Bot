// Dependencies
const { Embed, time: { read24hrFormat, getReadableTime }, functions: { checkMusic } } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * seekrewind command
 * @extends {Command}
*/
export default class SeekRewind extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'seek-rewind',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['rw'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Rewinds the player by your specified amount  (Default: 10 secs).',
			usage: 'rewind <time>',
			cooldown: 3000,
			examples: ['rw 1:00', 'rw 1:32:00'],
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'time',
				description: 'The amount of time to rewind by.',
				type: ApplicationCommandOptionType.String,
				required: false,
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(client, message) {
		// check to make sure client can play music based on permissions
		const playable = checkMusic(message.member, client);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable);

		const player = client.manager?.players.get(message.guild.id);

		// Make sure song isn't a stream
		if (!player.queue.current.isSeekable) return message.channel.error('music/rewind:LIVESTREAM');

		// update the time
		const time = read24hrFormat((message.args[0]) ? message.args[0] : '10');

		if (time + player.position <= 0) {
			message.channel.send(message.translate('music/rewind:INVALID'));
		} else {
			player.seek(player.position - time);
			const embed = new Embed(client, message.guild)
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/rewind:NEW_TIME', { NEW: new Date(player.position).toISOString().slice(14, 19), OLD: getReadableTime(time) }));
			message.channel.send({ embeds: [embed] });
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
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, client);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// Make sure song isn't a stream
		const player = client.manager?.players.get(member.guild.id);
		if (!player.queue.current.isSeekable) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/rewind:LIVESTREAM', { ERROR: null }, true)] });

		// update the time
		const time = read24hrFormat(args.get('time')?.value ?? '10');

		if (time + player.position <= 0) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/rewind:INVALID', { ERROR: null }, true)] });
		} else {
			player.seek(player.position - time);
			const embed = new Embed(client, guild)
				.setColor(member.displayHexColor)
				.setDescription(guild.translate('music/rewind:NEW_TIME', { NEW: new Date(player.position).toISOString().slice(14, 19), OLD: getReadableTime(time) }));
			interaction.reply({ embeds: [embed] });
		}
	}
}

