// Dependencies
const { Embed, time: { read24hrFormat, getReadableTime }, functions: { checkMusic } } = require('../../utils'),
	{ ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * seekto command
 * @extends {Command}
*/
export default class SeekTo extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'seek-to',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['rw'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Sets the playing track\'s position to the specified position.',
			usage: 'rewind <time>',
			cooldown: 3000,
			examples: ['rw 1:00', 'rw 1:32:00'],
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'time',
				description: 'The time to seek to.',
				type: ApplicationCommandOptionType.String,
				required: true,
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

		// update the time
		const player = client.manager?.players.get(member.guild.id);
		const time = read24hrFormat(args.get('time').value);

		if (time > player.queue.current.duration) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/seek:INVALID', { TIME: new Date(player.queue.current.duration).toISOString().slice(11, 19) }, true)] });
		} else {
			player.seek(time);
			const embed = new EmbedBuilder()
				.setColor(member.displayHexColor)
				.setDescription(client.translate('music/seek:UPDATED', { TIME: new Date(time).toISOString().slice(14, 19) }));
			interaction.reply({ embeds: [embed] });
		}
	}
}

