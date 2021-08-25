// Dependencies
const { Embed } = require('../../utils'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * speed command
 * @extends {Command}
*/
class Speed extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'speed',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Sets the player\'s playback speed.',
			usage: 'speed <Number>',
			cooldown: 3000,
			examples: ['speed 4'],
			slash: true,
			options: [{
				name: 'speed',
				description: 'The speed at what you want the song to go.',
				type: 'INTEGER',
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
	async run(bot, message) {
		// check to make sure bot can play music based on permissions
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		// Make sure song isn't a stream
		const player = bot.manager?.players.get(message.guild.id);
		if (!player.queue.current.isSeekable) return message.channel.error('music/speed:LIVESTREAM').then(m => m.timedDelete({ timeout: 10000 }));

		// Make sure Number is a number
		if (isNaN(message.args[0]) || message.args[0] < 0 || message.args[0] > 10) return message.channel.error('music/speed:INVALID').then(m => m.timedDelete({ timeout: 10000 }));

		// Change speed value
		try {
			player.setSpeed(message.args[0]);
			const msg = await message.channel.send(message.translate('music/speed:ON_SPD'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/speed:UPDATED', { NUM: player.speed }));
			await bot.delay(5000);
			player.speed = message.args[0];
			return msg.edit({ content: '​​ ', embeds: [embed] });
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
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
			channel = guild.channels.cache.get(interaction.channelId),
			speed = args.get('speed').value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		const player = bot.manager?.players.get(member.guild.id);

		// Make sure song isn't a stream
		if (!player.queue.current.isSeekable) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/speed:LIVESTREAM', { ERROR: null }, true)] });

		// Change speed value
		try {
			player.setSpeed(speed);
			await interaction.reply({ content: guild.translate('music/speed:ON_SPD') });
			const embed = new Embed(bot, guild)
				.setDescription(guild.translate('music/speed:UPDATED', { NUM: player.speed }));
			await bot.delay(5000);
			player.speed = speed;
			return interaction.editReply({ content: '​​ ', embeds: [embed] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

module.exports = Speed;
