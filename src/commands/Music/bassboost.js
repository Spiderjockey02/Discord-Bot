// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Bassboost extends Command {
	constructor(bot) {
		super(bot, {
			name: 'bassboost',
			dirname: __dirname,
			aliases: ['bb'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Bassboost the song',
			usage: 'bassboost [value]',
			cooldown: 3000,
			examples: ['bb 8', 'bb'],
			slash: true,
			options: [{
				name: 'amount',
				description: 'The amount you want to bass-boost the song.',
				type: 'STRING',
				required: false,
			}],
		});
	}

	// Function for message command
	async run(bot, message) {
		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));


		// update player's bassboost
		const player = bot.manager.players.get(message.guild.id);
		if (!message.args[0]) {
			player.setBassboost(!player.bassboost);
			const msg = await message.channel.send(message.translate(`music/bassboost:${player.bassboost ? 'ON' : 'OFF'}_BB`));
			const embed = new MessageEmbed()
				.setDescription(message.translate(`music/bassboost:DESC_${player.bassboost ? '1' : '2'}`));
			await bot.delay(5000);
			return msg.edit({ content: '​​ ', embeds: [embed] });
		}

		// Make sure value is a number
		if (isNaN(message.args[0])) return message.channel.send(message.translate('music/bassboost:INVALID'));

		// Turn on bassboost with custom value
		player.setBassboost(parseInt(message.args[0]) / 10);
		const msg = await message.channel.send(message.translate('music/bassboost:SET_BB', { DB: message.args[0] }));
		const embed = new MessageEmbed()
			.setDescription(message.translate('music/bassboost:DESC_3', { DB: message.args[0] }));
		await bot.delay(5000);
		return msg.edit({ content: '​​ ', embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelID),
			amount = args.get('amount')?.value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return bot.send(interaction, { embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// update player's bassboost
		const player = bot.manager.players.get(member.guild.id);
		if (!amount) {
			player.setBassboost(!player.bassboost);
			await bot.send(interaction, { content: guild.translate(`music/bassboost:${player.bassboost ? 'ON' : 'OFF'}_BB`) });
			const embed = new MessageEmbed()
				.setDescription(guild.translate(`music/bassboost:DESC_${player.bassboost ? '1' : '2'}`));
			await bot.delay(5000);
			return await interaction.editReply({ content: '​​ ', embeds: [embed] });
		}

		// Make sure value is a number
		if (isNaN(amount)) return bot.send(interaction, { embeds: [channel.error('music/bassboost:INVALID', { ERROR: null }, true)], ephemeral: true });

		// Turn on bassboost with custom value
		player.setBassboost(amount / 10);
		await bot.send(interaction, { content: guild.translate('music/bassboost:SET_BB', { DB: amount }) });
		const embed = new MessageEmbed()
			.setDescription(bot.translate('music/bassboost:DESC_3', { DB: amount }));
		await bot.delay(5000);
		return interaction.editReply({ content: '​​ ', embeds: [embed] });
	}
};
