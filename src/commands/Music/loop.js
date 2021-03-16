// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Loop extends Command {
	constructor(bot) {
		super(bot, {
			name: 'loop',
			dirname: __dirname,
			aliases: ['repeat'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Loops the song or queue.',
			usage: 'loop [queue | song | off]',
			cooldown: 3000,
			examples: ['loop queue', 'loop off'],
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

		// Check what to loop (queue or song) - default to song
		if (!args[0] || args[0].toLowerCase() == 'song') {
			// (un)loop the song
			player.setTrackRepeat(!player.trackRepeat);
			const trackRepeat = player.trackRepeat ? 'enabled' : 'disabled';
			return message.channel.send(`${trackRepeat} track repeat.`);
		} else if (args[0].toLowerCase() == 'queue') {
			// (un)loop the queue
			player.setQueueRepeat(!player.queueRepeat);
			const queueRepeat = player.queueRepeat ? 'enabled' : 'disabled';
			return message.channel.send(`${queueRepeat} queue repeat.`);
		}
	}
};
