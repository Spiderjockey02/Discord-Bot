// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Resume extends Command {
	constructor(bot) {
		super(bot, {
			name: 'resume',
			dirname: __dirname,
			aliases: ['previous', 'prev'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Resumes the music.',
			usage: 'resume',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

		// Check that user is in the same voice channel
		if (message.member.voice.channel.id !== player.voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

		// The music is already resumed
		if (!player.paused) return message.error(settings.Language, 'MUSIC/ALREADY_RESUMED', settings.prefix);

		// Resumes the music
		player.pause(false);
		return message.success(settings.Language, 'MUSIC/SUCCESFULL_RESUME');
	}
};
