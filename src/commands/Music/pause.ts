// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * pause command
 * @extends {Command}
*/
class Pause extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'pause',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Pauses the music.',
			usage: 'pause',
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
	async run(bot, message, settings) {
		// check to make sure bot can play music based on permissions
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable);

		const player = bot.manager?.players.get(message.guild.id);

		// The music is already paused
		if (player.paused) return message.channel.error('music/pause:IS_PAUSED', { PREFIX: settings.prefix });

		// Pauses the music
		player.pause(true);
		return message.channel.success('music/pause:SUCCESS');
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

		// The music is already paused
		const player = bot.manager?.players.get(member.guild.id);
		if (player.paused) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/pause:IS_PAUSED', {}, true)] });

		// Pauses the music
		player.pause(true);
		return interaction.reply({ embeds: [channel.success('music/pause:SUCCESS', {}, true)] });
	}
}

module.exports = Pause;
