// Dependencies
const { Embed } = require('../../utils'),
	{ getSong } = require('genius-lyrics-api'),
	{ paginate } = require('../../utils'),
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
	async run(bot, message) {
		// Check that a song is being played
		let options;
		if (message.args.length == 0) {
			// Check if a song is playing and use that song
			const player = bot.manager.players.get(message.guild.id);
			if (!player) return message.channel.error('misc:NO_QUEUE').then(m => m.delete({ timeout: 10000 }));
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

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// search for and send lyrics
		try {
			const info = await getSong(options);

			// make sure lyrics were found
			if (!info || !info.lyrics) {
				msg.delete();
				return message.channel.send(message.translate('music/lyrics:NO_LYRICS'));
			}

			// create pages
			let pagesNum = Math.ceil(info.lyrics.length / 2048);
			if (pagesNum === 0) pagesNum = 1;

			const pages = [];
			for (let i = 0; i < pagesNum; i++) {
				const embed = new Embed(bot, message.guild)
					.setTitle(options.title)
					.setURL(info.url)
					.setDescription(info.lyrics.substring(i * 2048, (i + 1) * 2048))
					.setTimestamp()
					.setFooter('music/lyrics:FOOTER', { TAG: message.author.tag }, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));
				pages.push(embed);
			}

			// show paginator
			msg.delete();
			paginate(bot, message, pages);
		} catch(err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
