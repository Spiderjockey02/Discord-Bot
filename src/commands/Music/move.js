// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Move extends Command {
	constructor(bot) {
		super(bot, {
			name: 'move',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Moves the specified song to the specified position.',
			usage: 'move <position> <new position>',
			cooldown: 3000,
			examples: ['move 4 8'],
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

		// Make sure positions are number(s)
		if (isNaN(args[0])) return message.channel.send('Invalid number.');

		// Can't move currently playing song
		if (args[0] === 0) return message.channel.send(`Cannot move a song that is already playing. To skip the current playing song type: \`${settings.prefix}skip\``);

		// Make sure number is position in the queue
		if ((args[0] > player.queue.length) || (args[0] && !player.queue[args[0]])) return message.channel.send('Song not found.');

		if (!args[1]) {
			const song = player.queue[args[0] - 1];
			player.queue.splice(args[0] - 1, 1);
			player.queue.splice(0, 0, song);
			return message.channel.send(`Moved **${song.title}** to the beginning of the queue.`);
		} else if (args[1]) {
			if (args[1] == 0) return message.channel.send(`Cannot move a song that is already playing. To skip the current playing song type: \`${settings.prefix}skip\``);
			if ((args[1] > player.queue.length) || !player.queue[args[1]]) return message.channel.send('Song not found.');
			const song = player.queue[args[0] - 1];
			player.queue.splice(args[0] - 1, 1);
			player.queue.splice(args[1] - 1, 0, song);
			return message.channel.send(`Moved **${song.title}** to the position ${args[1]}.`);
		}
	}
};
