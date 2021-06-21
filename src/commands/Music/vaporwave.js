// Dependencies
const { Embed } = require('../../utils'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Vaporwave extends Command {
	constructor(bot) {
		super(bot, {
			name: 'vaporwave',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Toggles vaporwave mode.',
			usage: 'vaporwave',
			cooldown: 3000,
			examples: ['vaporwave off'],
			slash: true,
		});
	}

	// Function for message command
	async run(bot, message) {
		// check to make sure bot can play music based on permissions
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		const player = bot.manager.players.get(message.guild.id);

		if (message.args[0] && (message.args[0].toLowerCase() == 'reset' || message.args[0].toLowerCase() == 'off')) {
			player.resetFilter();
			const msg = await message.channel.send(message.translate('music/vaporwave:OFF_VW'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/vaporwave:DESC_2'));
			await bot.delay(5000);
			return msg.edit({ embeds: [embed] });
		} else {
			player.setFilter({
				equalizer: [
					{ band: 1, gain: 0.3 },
					{ band: 0, gain: 0.3 },
				],
				timescale: { pitch: 0.5 },
				tremolo: { depth: 0.3, frequency: 14 },
			});
			const msg = await message.channel.send(message.translate('music/vaporwave:ON_VW'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/vaporwave:DESC_1'));
			await bot.delay(5000);
			return msg.edit({ embeds: [embed] });
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelID);

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return bot.send(interaction, { embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// toggle nightcore mode on/off
		const player = bot.manager.players.get(member.guild.id);
		player.setVaporwave(!player.nightcore);
		const msg = await bot.send(interaction, { content: guild.translate(`music/vaporwave:${player.nightcore ? 'ON' : 'OFF'}_NC`) });
		const embed = new Embed(bot, guild)
			.setDescription(guild.translate(`music/vaporwave:DESC_${player.nightcore ? '1' : '2'}`));
		await bot.delay(5000);
		if (player.nightcore) player.speed = 1.2;
		return msg.editReply(embed);
	}
};
