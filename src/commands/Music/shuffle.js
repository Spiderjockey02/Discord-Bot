// Dependencies
const { EmbedBuilder, PermissionsBitField: { Flags } } = require('discord.js'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * shuffle command
 * @extends {Command}
*/
class Shuffle extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'shuffle',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Shuffles the playlist.',
			usage: 'shuffle',
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
		// check to make sure bot can play music based on permissions
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable);

		// shuffle queue
		const player = bot.manager?.players.get(message.guild.id);
		player.queue.shuffle();
		const embed = new EmbedBuilder()
			.setColor(message.member.displayHexColor)
			.setDescription(message.translate('music/shuffle:DESC'));
		message.channel.send({ embeds: [embed] });
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

		// shuffle queue
		const player = bot.manager?.players.get(member.guild.id);
		player.queue.shuffle();
		const embed = new EmbedBuilder()
			.setColor(member.displayHexColor)
			.setDescription(guild.translate('music/shuffle:DESC'));
		interaction.reply({ embeds: [embed] });
	}
}

module.exports = Shuffle;
