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
			examples: ['remove 3', 'remove 3 7'],
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

		if (isNaN(message.args[0])) return message.channel.send('Invalid number.');

		if (!message.args[1]) {
			if (message.args[0] == 0) return message.channel.send(`Cannot remove a song that is already playing. To skip the song type: \`${settings.prefix}skip\``);
			if (message.args[0] > player.queue.length) return message.channel.send('Song not found.');

			const { title } = player.queue[message.args[0] - 1];

			player.queue.splice(message.args[0] - 1, 1);
			return message.channel.send(`Removed **${title}** from the queue`);
		} else {
			if (message.args[0] == 0 || message.args[1] == 0) return message.channel.send(`Cannot remove a song that is already playing. To skip the song type: \`${settings.prefix}skip\``);
			if (message.args[0] > player.queue.length || message.args[1] > player.queue.length) return message.channel.send('Song not found.');
			if (message.args[0] > message.args[1]) return message.channel.send('Start amount must be bigger than end.');

			const songsToRemove = message.args[1] - message.args[0];
			player.queue.splice(message.args[0] - 1, songsToRemove + 1);
			return message.channel.send(`Removed **${songsToRemove + 1}** songs from the queue`);
		}
	}
};
