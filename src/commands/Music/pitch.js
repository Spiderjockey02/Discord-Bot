// Dependecies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Pitch extends Command {
	constructor(bot) {
		super(bot, {
			name: 'pitch',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Sets the player\'s pitch. If you input "reset", it will set the pitch back to default.',
			usage: 'pitch',
			cooldown: 3000,
			examples: ['pitch off', 'pitch 6'],
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
			const msg = await message.channel.send(message.translate('music/pitch:PITCH_OFF'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/pitch:DESC_1'));
			await bot.delay(5000);
			return msg.edit('', embed);
		}

		if (isNaN(message.args[0])) return message.channel.send(message.translate('music/pitch:INVALID'));
		if (message.args[0] < 0 || message.args[0] > 10) return message.channel.send(message.translate('music/pitch:INCORRECT'));

		player.setFilter({
			timescale: { pitch: message.args[0] },
		});
		const msg = await message.channel.send(message.translate('music/pitch:PITCH_ON', { NUM: message.args[0] }));
		const embed = new Embed(bot, message.guild)
			.setDescription(message.translate('music/pitch:DESC_2', { NUM: message.args[0] }));
		await bot.delay(5000);
		return msg.edit('', embed);
	}
};
