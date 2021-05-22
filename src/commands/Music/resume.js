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

		// The music is already resumed
		if (!player.paused) return message.channel.error('music/resume:IS_RESUMED', { PREFIX: settings.prefix });

		// Resumes the music
		player.pause(false);
		return message.channel.success('music/resume:SUCCESS');
	}
};
