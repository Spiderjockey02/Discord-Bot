// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

// function to convert 1:00 to 60 * 1000 milliseconds
function hmsToSecondsOnly(str) {
	const p = str.split(':');
	let s = 0, m = 1;

	while (p.length > 0) {
		s = +m * parseInt(p.pop(), 10);
		m = m * 60;
	}
	return s;
}

module.exports = class Rewind extends Command {
	constructor(bot) {
		super(bot, {
			name: 'rewind',
			dirname: __dirname,
			aliases: ['rw'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Rewinds the player by your specified amount.',
			usage: 'rewind <time>',
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

		// Make sure song isn't a stream
		if (!player.queue.current.isSeekable) {
			return message.error(settings.Language, 'MUSIC/LIVESTREAM');
		}

		// update the time
		const time = hmsToSecondsOnly(args[0]) * 1000;
		if (time + player.position <= 0) {
			message.channel.send('A song can not be less than 0 seconds long');
		} else {
			player.seek(player.position - time);
			const embed = new MessageEmbed()
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate(settings.Language, 'MUSIC/TIME_MOVED', new Date(player.position).toISOString().slice(14, 19)));
			message.channel.send(embed);
		}
	}
};
