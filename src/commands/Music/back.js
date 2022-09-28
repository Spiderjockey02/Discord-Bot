// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Back command
 * @extends {Command}
*/
class Back extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'back',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['previous', 'prev'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Plays the previous song in the queue.',
			usage: 'back',
			cooldown: 3000,
			slash: true,
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message) {
		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable);

		// Make sure there was a previous song
		const player = bot.manager?.players.get(message.guild.id);
		if (player.queue.previous == null) return message.channel.send(message.translate('music/back:NO_PREV'));

		// Start playing the previous song
		player.queue.unshift(player.queue.previous);
		player.stop();
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// Make sure there was a previous song
		const player = bot.manager?.players.get(member.guild.id);
		if (player.queue.previous == null) return interaction.reply({ content: guild.translate('music/back:NO_PREV') });

		// Start playing the previous song
		player.queue.unshift(player.queue.previous);
		player.stop();
	}
}

module.exports = Back;
