// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ time: { read24hrFormat }, functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * seek command
 * @extends {Command}
*/
class Seek extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'seek',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Sets the playing track\'s position to the specified position.',
			usage: 'seek <time>',
			cooldown: 3000,
			examples: ['seek 1:00'],
			slash: true,
			options: [{
				name: 'time',
				description: 'The time you want to seek to.',
				type: 'STRING',
				required: true,
			}],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message, settings) {
		// check to make sure bot can play music based on permissions
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		// Make sure song isn't a stream
		const player = bot.manager?.players.get(message.guild.id);
		if (!player.queue.current.isSeekable) return message.channel.error('music/seek:LIVSTREAM').then(m => m.timedDelete({ timeout: 10000 }));

		// Make sure a time was inputted
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/seek:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// update the time
		const time = read24hrFormat((message.args[0]) ? message.args[0] : '10');

		if (time > player.queue.current.duration) {
			message.channel.send(message.translate('music/seek:INVALID', { TIME: new Date(player.queue.current.duration).toISOString().slice(11, 19) }));
		} else {
			player.seek(time);
			const embed = new MessageEmbed()
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/seek:UPDATED', { TIME: new Date(time).toISOString().slice(14, 19) }));
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

		// update the time
		const player = bot.manager?.players.get(member.guild.id);
		const time = read24hrFormat(args.get('time').value);

		if (time > player.queue.current.duration) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/seek:INVALID', { TIME: new Date(player.queue.current.duration).toISOString().slice(11, 19) }, true)] });
		} else {
			player.seek(time);
			const embed = new MessageEmbed()
				.setColor(member.displayHexColor)
				.setDescription(bot.translate('music/seek:UPDATED', { TIME: new Date(time).toISOString().slice(14, 19) }));
			interaction.reply({ embeds: [embed] });
		}
	}
}

module.exports = Seek;
