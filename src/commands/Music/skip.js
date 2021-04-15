// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Skip extends Command {
	constructor(bot) {
		super(bot, {
			name:  'skip',
			dirname: __dirname,
			aliases: ['next', 'skipto'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Skips the current song.',
			usage: 'skip',
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

		// skip song
		if (!isNaN(message.args[0]) && message.args[0] < player.queue.length) {
			player.stop(parseInt(message.args[0]));
		} else {
			player.stop();
		}
	}
};
