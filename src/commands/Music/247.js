// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class TwentyFourSeven extends Command {
	constructor(bot) {
		super(bot, {
			name: '247',
			dirname: __dirname,
			aliases: ['stay', '24/7'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Stays in the voice channel even if no one is in it.',
			usage: '24/7',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error(settings.Language, 'MUSIC/MISSING_DJROLE').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.channel.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

		// Check that user is in the same voice channel
		if (message.member.voice.channel.id !== player.voiceChannel) return message.channel.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

		// toggle 24/7 mode off and on
		if (player.twentyFourSeven) {
			player.twentyFourSeven = false;
			return message.channel.send('24/7 mode is now off.');
		} else {
			player.twentyFourSeven = true;
			return message.channel.send('24/7 mode is now on.');
		}
	}
};
