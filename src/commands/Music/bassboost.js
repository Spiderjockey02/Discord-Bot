// Dependencies
const { EmbedBuilder, ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Bassboost command
 * @extends {Command}
*/
class Bassboost extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'bassboost',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['bb'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Bassboost the song',
			usage: 'bassboost [value]',
			cooldown: 3000,
			examples: ['bb 8', 'bb'],
			slash: true,
			options: [{
				name: 'amount',
				description: 'The amount you want to bass-boost the song.',
				type: ApplicationCommandOptionType.Integer,
				required: false,
			}],
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


		// update player's bassboost
		const player = bot.manager?.players.get(message.guild.id);
		let msg, embed;
		if (!message.args[0]) {
			player.setBassboost(!player.bassboost);
			msg = await message.channel.send(message.translate(`music/bassboost:${player.bassboost ? 'ON' : 'OFF'}_BB`));
			embed = new EmbedBuilder()
				.setDescription(message.translate(`music/bassboost:DESC_${player.bassboost ? '1' : '2'}`));
			await bot.delay(5000);
			return msg.edit({ content: '​​ ', embeds: [embed] });
		}

		// Make sure value is a number
		if (isNaN(message.args[0])) return message.channel.error('music/bassboost:INVALID');

		// Turn on bassboost with custom value
		player.setBassboost(parseInt(message.args[0]) / 10);
		msg = await message.channel.send(message.translate('music/bassboost:SET_BB', { DB: message.args[0] }));
		embed = new EmbedBuilder()
			.setDescription(message.translate('music/bassboost:DESC_3', { DB: message.args[0] }));
		await bot.delay(5000);
		return msg.edit({ content: '​​ ', embeds: [embed] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			amount = args.get('amount')?.value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// update player's bassboost
		const player = bot.manager?.players.get(member.guild.id);
		let embed;
		if (!amount) {
			player.setBassboost(!player.bassboost);
			await interaction.reply({ content: guild.translate(`music/bassboost:${player.bassboost ? 'ON' : 'OFF'}_BB`) });
			embed = new EmbedBuilder()
				.setDescription(guild.translate(`music/bassboost:DESC_${player.bassboost ? '1' : '2'}`));
			await bot.delay(5000);
			return interaction.editReply({ content: '​​ ', embeds: [embed] });
		}

		// Turn on bassboost with custom value
		player.setBassboost(amount / 10);
		await interaction.reply({ content: guild.translate('music/bassboost:SET_BB', { DB: amount }) });
		embed = new EmbedBuilder()
			.setDescription(bot.translate('music/bassboost:DESC_3', { DB: amount }));
		await bot.delay(5000);
		return interaction.editReply({ content: '​​ ', embeds: [embed] });
	}
}

module.exports = Bassboost;
