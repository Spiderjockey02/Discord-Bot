// Dependencies
const { Embed } = require('../../utils'),
	{ time: { read24hrFormat, getReadableTime }, functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * rewind command
 * @extends {Command}
*/
class Rewind extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'rewind',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['rw'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Rewinds the player by your specified amount.',
			usage: 'rewind <time>',
			cooldown: 3000,
			examples: ['rw 1:00', 'rw 1:32:00'],
			slash: true,
			options: [{
				name: 'time',
				description: 'The time you want to rewind to.',
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
		// check to make sure bot can play music based on permissions
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		const player = bot.manager?.players.get(message.guild.id);

		// Make sure song isn't a stream
		if (!player.queue.current.isSeekable) return message.channel.error('music/rewind:LIVESTREAM');

		// update the time
		const time = read24hrFormat((message.args[0]) ? message.args[0] : '10');

		if (time + player.position <= 0) {
			message.channel.send(message.translate('music/rewind:INVALID'));
		} else {
			player.seek(player.position - time);
			const embed = new Embed(bot, message.guild)
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/rewind:NEW_TIME', { NEW: new Date(player.position).toISOString().slice(14, 19), OLD: getReadableTime(time) }));
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
		if (!player.queue.current.isSeekable) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/rewind:LIVESTREAM', { ERROR: null }, true)] });

		// update the time
		const time = read24hrFormat(args.get('time')?.value ?? '10');

		if (time + player.position <= 0) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/rewind:INVALID', { ERROR: null }, true)] });
		} else {
			player.seek(player.position - time);
			const embed = new Embed(bot, guild)
				.setColor(member.displayHexColor)
				.setDescription(guild.translate('music/rewind:NEW_TIME', { NEW: new Date(player.position).toISOString().slice(14, 19), OLD: getReadableTime(time) }));
			interaction.reply(embed);
		}
	}
}

module.exports = Rewind;
