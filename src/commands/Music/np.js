// Dependencies
const { Embed } = require('../../utils'),
	{ splitBar } = require('string-progressbar'),
	Command = require('../../structures/Command.js');

/**
 * NowPlaying command
 * @extends {Command}
*/
class NowPlaying extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'np',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['song'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Shows the current song playing.',
			usage: 'np',
			cooldown: 3000,
			slash: true,
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		const player = bot.manager?.players.get(message.guild.id);
		if (!player || !player.queue.current) return message.channel.error('misc:NO_QUEUE').then(m => m.timedDelete({ timeout: 10000 }));

		// Get current song information
		const { title, requester, thumbnail, uri, duration } = player.queue.current;
		const end = (duration > 6.048e+8) ? message.translate('music/np:LIVE') : new Date(duration).toISOString().slice(11, 19);
		// Display current song information
		try {
			const embed = new Embed(bot, message.guild)
				.setAuthor({ name: message.translate('music/np:AUTHOR') })
				.setColor(message.member.displayHexColor)
				.setThumbnail(thumbnail)
				.setDescription(`[${title}](${uri}) [${message.guild.members.cache.get(requester.id)}]`)
				.addField('\u200b', new Date(player.position * player.speed).toISOString().slice(11, 19) + ' [' + splitBar(duration > 6.048e+8 ? player.position * player.speed : duration, player.position * player.speed, 15)[0] + '] ' + end, false);
			message.channel.send({ embeds: [embed] });
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
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		// Check if the member has role to interact with music plugin
		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { ERROR: null }, true)] });
			}
		}

		// Check that a song is being played
		const player = bot.manager?.players.get(guild.id);
		if(!player) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NO_QUEUE', { ERROR: null }, true)] });

		// Get current song information
		const { title, requester, thumbnail, uri, duration } = player.queue.current;
		const end = (duration > 6.048e+8) ? bot.translate('music/np:LIVE') : new Date(duration).toISOString().slice(11, 19);
		// Display current song information
		try {
			const embed = new Embed(bot, guild)
				.setAuthor({ name: bot.translate('music/np:AUTHOR') })
				.setColor(member.displayHexColor)
				.setThumbnail(thumbnail)
				.setDescription(`[${title}](${uri}) [${guild.members.cache.get(requester.id)}]`)
				.addField('\u200b', new Date(player.position * player.speed).toISOString().slice(11, 19) + ' [' + splitBar(duration > 6.048e+8 ? player.position * player.speed : duration, player.position * player.speed, 15)[0] + '] ' + end, false);
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: null }, true)] });
		}
	}
}

module.exports = NowPlaying;
