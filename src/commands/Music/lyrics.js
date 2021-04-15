// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ getSong } = require('genius-lyrics-api'),
	paginate = require('../../utils/pagenator'),
	Command = require('../../structures/Command.js');

module.exports = class Lyrics extends Command {
	constructor(bot) {
		super(bot, {
			name: 'lyrics',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get lyrics on a song.',
			usage: 'lyrics [song]',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check that a song is being played
		let options;
		if (message.args.length == 0) {
			// Check if a song is playing and use that song
			const player = bot.manager.players.get(message.guild.id);
			if (!player) return message.channel.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));
			options = {
				apiKey: bot.config.api_keys.genuis,
				title: player.queue.current.title,
				artist: '',
				optimizeQuery: true,
			};
		} else {
			// Use the message.args for song search
			options = {
				apiKey: bot.config.api_keys.genuis,
				title: message.args.join(' '),
				artist: '',
				optimizeQuery: true,
			};
		}

		const wait = await message.channel.send('Searching for lyrics');
		// search for and send lyrics
		try {
			const info = await getSong(options);

			// make sure lyrics were found
			if (!info || !info.lyrics) {
				wait.delete();
				return message.channel.send('No lyrics found');
			}

			// create pages
			let pagesNum = Math.ceil(info.lyrics.length / 2048);
			if (pagesNum === 0) pagesNum = 1;

			const pages = [];
			for (let i = 0; i < pagesNum; i++) {
				const embed = new MessageEmbed()
					.setTitle(options.title)
					.setURL(info.url)
					.setDescription(info.lyrics.substring(i * 2048, (i + 1) * 2048))
					.setTimestamp()
					.setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));
				pages.push(embed);
			}

			// show paginator
			wait.delete();
			paginate(bot, message, pages);
		} catch(err) {
			if (message.deletable) message.delete();
			wait.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
