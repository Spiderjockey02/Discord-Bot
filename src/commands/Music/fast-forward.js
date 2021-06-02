// Dependencies
const { Embed } = require('../../utils'),
	{ time: { read24hrFormat, getReadableTime } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class FastForward extends Command {
	constructor(bot) {
		super(bot, {
			name: 'fast-forward',
			dirname: __dirname,
			aliases: ['ffw', 'fastforward'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Fast forwards the player by your specified amount.',
			usage: 'fast-forward <time>',
			cooldown: 3000,
			examples: ['ffw 1:00', 'ffw 1:32:00'],
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
		if (!player.queue.current.isSeekable) return message.channel.error('music/fast-forward:LIVESTREAM');

		// update the time
		const time = read24hrFormat((message.args[0]) ? message.args[0] : '10');

		if (time + player.position >= player.queue.current.duration) {
			message.channel.send(message.translate('music/fast-forward:TOO_LONG', { TIME: new Date(player.queue.current.duration).toISOString().slice(14, 19) }));
		} else {
			player.seek(player.position + time);
			const embed = new Embed(bot, message.guild)
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/fast-forward:DESC', { NEW: new Date(player.position).toISOString().slice(14, 19), OLD: getReadableTime(time) }));
			message.channel.send(embed);
		}
	}
};
