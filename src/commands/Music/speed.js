// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Speed extends Command {
	constructor(bot) {
		super(bot, {
			name: 'speed',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Sets the player\'s playback speed.',
			usage: 'speed <Number>',
			cooldown: 3000,
			examples: ['speed 4'],
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.error(settings.Language, 'MUSIC/MISSING_DJROLE').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

		// Check that user is in the same voice channel
		if (message.member.voice.channel.id !== player.voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

		// Make sure song isn't a stream
		if (!player.queue.current.isSeekable) {
			return message.error(settings.Language, 'MUSIC/LIVESTREAM');
		}

		// Make sure Number is a number
		if (isNaN(args[0])) {
			return message.error(settings.Language, 'NOT_NUMBER');
		}

		// Make sure number is between 1 and 10
		if (args[0] < 0 || args[0] > 10) {
			return message.error(settings.Language, 'MUSIC/INCORRECT_NUMBER');
		}

		// Change speed value
		try {
			player.setSpeed(args[0]);
			message.channel.send(`Speed is ${player.speed}`);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
