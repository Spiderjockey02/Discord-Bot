// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Speed extends Command {
	constructor(bot) {
		super(bot, {
			name: 'speed',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Sets the player\'s playback speed.',
			usage: 'speed <Number>',
			cooldown: 3000,
			examples: ['speed 4'],
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

		// Make sure song isn't a stream
		if (!player.queue.current.isSeekable) return message.channel.error('music/speed:LIVESTREAM');

		// Make sure Number is a number
		if (isNaN(message.args[0]) || message.args[0] < 0 || message.args[0] > 10) return message.channel.error('music/speed:INVALID');

		// Change speed value
		try {
			player.setSpeed(message.args[0]);
			const msg = await message.channel.send(message.translate('music/speed:ON_SPD'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/speed:UPDATED', { NUM: player.speed }));
			await bot.delay(5000);
			return msg.edit('', embed);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
