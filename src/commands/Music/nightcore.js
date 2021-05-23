// Dependecies
const { Embed } = require('../../utils'),
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

		if (message.args[0] && (message.args[0].toLowerCase() == 'reset' || message.args[0].toLowerCase() == 'off')) {
			player.resetFilter();
			const msg = await message.channel.send(message.translate('music/nightcore:OFF_NC'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/nightcore:DESC_2'));
			await bot.delay(5000);
			return msg.edit('', embed);
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
			return msg.edit('', embed);
		}
	}
};
