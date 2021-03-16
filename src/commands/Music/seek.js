// Dependencies
const { MessageEmbed } = require('discord.js'),
	ms = require('../../utils/timeFormatter'),
	Command = require('../../structures/Command.js'),
	MS = new ms;

module.exports = class Seek extends Command {
	constructor(bot) {
		super(bot, {
			name: 'seek',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Sets the playing track\'s position to the specified position.',
			usage: 'seek <time>',
			cooldown: 3000,
			examples: ['seek 1:00'],
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
		if (!player.queue.current.isSeekable) {
			return message.error(settings.Language, 'MUSIC/LIVESTREAM');
		}

		// Make sure a time was inputted
		if (!args[0]) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('seek').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

		// update the time
		const time = MS.read24hrFormat((args[0]) ? args[0] : '10');

		if (time > player.queue.current.duration) {
			message.channel.send(`Less than ${player.queue.current.duration}`);
		} else {
			player.seek(time);
			const embed = new MessageEmbed()
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate(settings.Language, 'MUSIC/TIME_MOVED', args[0]));
			message.channel.send(embed);
		}
	}
};
