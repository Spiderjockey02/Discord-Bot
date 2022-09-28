// Dependencies
const { EmbedBuilder, PermissionsBitField: { Flags } } = require('discord.js'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Nightcore command
 * @extends {Command}
*/
class Nightcore extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'nightcore',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Toggles nightcore mode.',
			usage: 'nightcore',
			cooldown: 3000,
			examples: ['nightcore'],
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

		// toggle nightcore mode on/off
		const player = bot.manager?.players.get(message.guild.id);
		player.setNightcore(!player.nightcore);
		const msg = await message.channel.send(message.translate(`music/nightcore:${player.nightcore ? 'ON' : 'OFF'}_NC`));
		const embed = new EmbedBuilder()
			.setDescription(message.translate(`music/nightcore:DESC_${player.nightcore ? '1' : '2'}`));
		await bot.delay(5000);
		if (player.nightcore) player.speed = 1.2;
		return msg.edit({ content: '​​ ', embeds: [embed] });
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

		// toggle nightcore mode on/off
		const player = bot.manager?.players.get(member.guild.id);
		player.setNightcore(!player.nightcore);
		await interaction.reply({ content: guild.translate(`music/nightcore:${player.nightcore ? 'ON' : 'OFF'}_NC`) });
		const embed = new EmbedBuilder()
			.setDescription(guild.translate(`music/nightcore:DESC_${player.nightcore ? '1' : '2'}`));
		await bot.delay(5000);
		if (player.nightcore) player.speed = 1.2;
		return interaction.editReply({ content: '​​ ', embeds: [embed] });
	}
}

module.exports = Nightcore;
