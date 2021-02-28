// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Skip extends Command {
	constructor(bot) {
		super(bot, {
			name:  'skip',
			dirname: __dirname,
			aliases: ['next'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Skips the current song.',
			usage: 'skip',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

		// skip song
		player.stop();
	}
};
