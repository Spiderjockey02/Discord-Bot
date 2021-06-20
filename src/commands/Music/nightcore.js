// Dependencies
const { Embed } = require('../../utils'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Nightcore extends Command {
	constructor(bot) {
		super(bot, {
			name: 'nightcore',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Toggles nightcore mode.',
			usage: 'nightcore',
			cooldown: 3000,
			examples: ['nightcore off'],
			slash: true,
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		const player = bot.manager.players.get(message.guild.id);

		if (message.args[0] && (message.args[0].toLowerCase() == 'reset' || message.args[0].toLowerCase() == 'off')) {
			player.resetFilter();
			const msg = await message.channel.send(message.translate('music/nightcore:OFF_NC'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/nightcore:DESC_2'));
			await bot.delay(5000);
			return msg.edit({ embeds: [embed] });
		} else {
			player.setFilter({
				equalizer: [
					{ band: 1, gain: 0.3 },
					{ band: 0, gain: 0.3 },
				],
				timescale: { pitch: 1.2 },
				tremolo: { depth: 0.3, frequency: 14 },
			});
			const msg = await message.channel.send(message.translate('music/nightcore:ON_NC'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/nightcore:DESC_1'));
			await bot.delay(5000);
			player.speed = 1.2;
			return msg.edit({ embeds: [embed] });
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelID),
			amount = args.get('amount').value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return bot.send(interaction, { embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// toggle nightcore mode on/off
		const player = bot.manager.players.get(member.guild.id);
		player.setNightcore(!player.nightcore);
		const msg = await bot.send(interaction, { content: bot.translate(`music/nightcore:${player.nightcore ? 'ON' : 'OFF'}_NC`) });
		const embed = new Embed(bot, guild)
			.setDescription(bot.translate(`music/nightcore:DESC_${player.nightcore ? '1' : '2'}`));
		await bot.delay(5000);
		if (player.nightcore) player.speed = 1.2;
		return interaction.editReply(embed);
	}
};
