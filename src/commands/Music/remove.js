// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Remove extends Command {
	constructor(bot) {
		super(bot, {
			name: 'remove',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Removes a song from the queue',
			usage: 'remove <position> [position]',
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

		if (isNaN(args[0])) return message.channel.send('Invalid number.');

		if (!args[1]) {
			if (args[0] == 0) return message.channel.send(`Cannot remove a song that is already playing. To skip the song type: \`${settings.prefix}skip\``);
			if (args[0] > player.queue.length) return message.channel.send('Song not found.');

			const { title } = player.queue[args[0] - 1];

			player.queue.splice(args[0] - 1, 1);
			return message.channel.send(`Removed **${title}** from the queue`);
		} else {
			if (args[0] == 0 || args[1] == 0) return message.channel.send(`Cannot remove a song that is already playing. To skip the song type: \`${settings.prefix}skip\``);
			if (args[0] > player.queue.length || args[1] > player.queue.length) return message.channel.send('Song not found.');
			if (args[0] > args[1]) return message.channel.send('Start amount must be bigger than end.');

			const songsToRemove = args[1] - args[0];
			player.queue.splice(args[0] - 1, songsToRemove + 1);
			return message.channel.send(`Removed **${songsToRemove + 1}** songs from the queue`);
		}
	}
};
