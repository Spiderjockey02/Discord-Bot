// Dependecies
const { Embed } = require('../../utils'),
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
			examples: ['bb 8', 'bb -4'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.channel.error('misc:NO_QUEUE').then(m => m.delete({ timeout: 10000 }));

		// Check that user is in the same voice channel
		if (message.member.voice.channel.id !== player.voiceChannel) return message.channel.error('misc:NOT_VOICE').then(m => m.delete({ timeout: 10000 }));

		// Default to turning on bassboost
		if (!message.args[0]) {
			player.setFilter({
				equalizer: [
					...Array(6).fill(0).map((n, i) => ({ band: i, gain: 0.65 })),
					...Array(9).fill(0).map((n, i) => ({ band: i + 6, gain: 0 })),
				],
			});
			const msg = await message.channel.send(message.translate('music/bassboost:ON_BB'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/bassboost:DESC_1'));
			await bot.delay(5000);
			return msg.edit('', embed);
		}

		// Turn off bassboost
		if (message.args[0].toLowerCase() == 'reset' || message.args[0].toLowerCase() == 'off') {
			player.resetFilter();
			const msg = await message.channel.send(message.translate('music/bassboost:OFF_BB'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/bassboost:DESC_1'));
			await bot.delay(5000);
			return msg.edit('', embed);
		}

		// Make sure value is a number
		if (isNaN(message.args[0])) return message.channel.send(message.translate('music/bassboost:INVALID'));

		// Turn on bassboost with custom value
		player.setFilter({
			equalizer: [
				...Array(6).fill(0).map((n, i) => ({ band: i, gain: message.args[0] / 10 })),
				...Array(9).fill(0).map((n, i) => ({ band: i + 6, gain: 0 })),
			],
		});
		const msg = await message.channel.send(message.translate('music/bassboost:SET_BB', { DB: message.args[0] }));
		const embed = new Embed(bot, message.guild)
			.setDescription(message.translate('music/bassboost:DESC_3', { DB: message.args[0] }));
		await bot.delay(5000);
		return msg.edit('', embed);
	}
};
