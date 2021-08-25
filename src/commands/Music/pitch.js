// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * pitch command
 * @extends {Command}
*/
class Pitch extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'pitch',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Sets the player\'s pitch. If you input "reset", it will set the pitch back to default.',
			usage: 'pitch',
			cooldown: 3000,
			examples: ['pitch off', 'pitch 6'],
			slash: true,
			options: [{
				name: 'amount',
				description: 'The amount you want to pitch the song.',
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

		if (message.args[0] && (message.args[0].toLowerCase() == 'reset' || message.args[0].toLowerCase() == 'off')) {
			player.resetFilter();
			const msg = await message.channel.send(message.translate('music/pitch:PITCH_OFF'));
			const embed = new MessageEmbed()
				.setDescription(message.translate('music/pitch:DESC_1'));
			await bot.delay(5000);
			return msg.edit({ content: '​​ ', embeds: [embed] });
		}

		if (isNaN(message.args[0])) return message.channel.send(message.translate('music/pitch:INVALID'));
		if (message.args[0] < 0 || message.args[0] > 10) return message.channel.send(message.translate('music/pitch:INCORRECT'));

		player.setFilter({
			timescale: { pitch: message.args[0] },
		});
		const msg = await message.channel.send(message.translate('music/pitch:PITCH_ON', { NUM: message.args[0] }));
		const embed = new MessageEmbed()
			.setDescription(message.translate('music/pitch:DESC_2', { NUM: message.args[0] }));
		await bot.delay(5000);
		return msg.edit({ content: '​​ ', embeds: [embed] });
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
		const member = guild.members.cache.get(interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelId);
		const amount = args.get('amount')?.value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		const player = bot.manager?.players.get(member.guild.id);

		if (amount && ['reset', 'off'].includes(amount.toLowerCase())) {
			player.resetFilter();
			await interaction.reply(bot.translate('music/pitch:PITCH_OFF'));
			const embed = new MessageEmbed(bot, guild)
				.setDescription(bot.translate('music/pitch:DESC_1'));
			await bot.delay(5000);
			return interaction.editReply({ content: '​​ ', embeds: [embed] });
		} else {
			player.setFilter({
				timescale: { pitch: amount },
			});
			await interaction.reply(guild.translate('music/pitch:PITCH_ON', { NUM: amount }));
			const embed = new MessageEmbed(bot, guild)
				.setDescription(bot.translate('music/pitch:DESC_2', { NUM: amount }));
			await bot.delay(5000);
			return interaction.editReply({ content: '​​ ', embeds: [embed] });
		}
	}
}

module.exports = Pitch;
