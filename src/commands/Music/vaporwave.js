// Dependencies
const { EmbedBuilder, PermissionsBitField: { Flags } } = require('discord.js'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * vaporwave command
 * @extends {Command}
*/
class Vaporwave extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'vaporwave',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Toggles vaporwave mode.',
			usage: 'vaporwave',
			cooldown: 3000,
			examples: ['vaporwave off'],
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

		// toggle vaporwave mode on/off
		const player = bot.manager?.players.get(message.guild.id);
		player.setVaporwave(!player.vaporwave);
		const msg = await message.channel.send(message.translate(`music/vaporwave:${player.vaporwave ? 'ON' : 'OFF'}_VW`));
		const embed = new EmbedBuilder()
			.setDescription(message.translate(`music/vaporwave:DESC_${player.vaporwave ? '1' : '2'}`));
		await bot.delay(5000);
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

		// toggle vaporwave mode on/off
		const player = bot.manager?.players.get(member.guild.id);
		player.setVaporwave(!player.vaporwave);
		await interaction.reply({ content: guild.translate(`music/vaporwave:${player.vaporwave ? 'ON' : 'OFF'}_VW`) });
		const embed = new EmbedBuilder()
			.setDescription(guild.translate(`music/vaporwave:DESC_${player.vaporwave ? '1' : '2'}`));
		await bot.delay(5000);
		return interaction.editReply({ content: '​​ ', embeds: [embed] });
	}
}

module.exports = Vaporwave;
