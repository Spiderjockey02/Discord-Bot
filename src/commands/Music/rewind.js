// Dependencies
const { MessageEmbed } = require('discord.js'),
	ms = require('../../utils/timeFormatter'),
	Command = require('../../structures/Command.js'),
	MS = new ms;

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
			examples: ['rw 1:00', 'rw 1:32:00'],
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

		// Make sure song isn't a stream
		if (!player.queue.current.isSeekable) return message.error(settings.Language, 'MUSIC/LIVESTREAM');

		// update the time
		const time = MS.read24hrFormat((args[0]) ? args[0] : '10');

		if (time + player.position <= 0) {
			message.channel.send('A song can not be less than 0 seconds long');
		} else {
			player.seek(player.position - time);
			const embed = new MessageEmbed()
				.setColor(message.member.displayHexColor)
				.setDescription(`**Rewinded \`${MS.getReadableTime(time)}\` to: \`${new Date(player.position).toISOString().slice(14, 19)}\`.**`);
			message.channel.send(embed);
		}
	}
};
