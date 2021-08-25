// Dependencies
const { Embed } = require('../../utils'),
	{ time: { read24hrFormat, getReadableTime }, functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Addrole command
 * @extends {Command}
*/
class FastForward extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'fast-forward',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['ffw', 'fastforward'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Fast forwards the player by your specified amount.',
			usage: 'fast-forward <time>',
			cooldown: 3000,
			examples: ['ffw 1:00', 'ffw 1:32:00'],
			slash: true,
			options: [{
				name: 'amount',
				description: 'The amount you want to fastforward.',
				type: 'STRING',
				required: false,
			}],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message) {
		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		// Make sure song isn't a stream
		const player = bot.manager?.players.get(message.guild.id);
		if (!player.queue.current.isSeekable) return message.channel.error('music/fast-forward:LIVESTREAM').then(m => m.timedDelete({ timeout: 5000 }));

		// update the time
		const time = read24hrFormat(message.args[0] ?? '10');

		if (time + player.position >= player.queue.current.duration) {
			message.channel.send(message.translate('music/fast-forward:TOO_LONG', { TIME: new Date(player.queue.current.duration).toISOString().slice(14, 19) }));
		} else {
			player.seek(player.position + time);
			const embed = new Embed(bot, message.guild)
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/fast-forward:DESC', { NEW: new Date(player.position).toISOString().slice(14, 19), OLD: getReadableTime(time) }));
			message.channel.send({ embeds: [embed] });
		}
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// Make sure song isn't a stream
		const player = bot.manager?.players.get(member.guild.id);
		if (!player.queue.current.isSeekable) return interaction.reply({ embeds: [channel.error('music/fast-forward:LIVESTREAM', { ERROR: null }, true)], ephemeral: true });

		// update the time
		const time = read24hrFormat(args.get('amount')?.value ?? '10');

		if (time + player.position >= player.queue.current.duration) {
			interaction.reply(guild.translate('music/fast-forward:TOO_LONG', { TIME: new Date(player.queue.current.duration).toISOString().slice(14, 19) }));
		} else {
			player.seek(player.position + time);
			const embed = new Embed(bot, guild)
				.setColor(member.displayHexColor)
				.setDescription(guild.translate('music/fast-forward:DESC', { NEW: new Date(player.position).toISOString().slice(14, 19), OLD: getReadableTime(time) }));
			interaction.reply({ embeds: [embed] });
		}
	}
}

module.exports = FastForward;
