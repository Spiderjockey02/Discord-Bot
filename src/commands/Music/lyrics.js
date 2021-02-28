// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ getSong } = require('genius-lyrics-api'),
	Command = require('../../structures/Command.js');

// pageinator
function Page(page, msg, title, info) {
	if (page == 0) {
		const embed = new MessageEmbed()
			.setTitle(title)
			.setURL(info.url)
			.setDescription(info.lyrics.substring(0, 2048))
			.setTimestamp();
		msg.edit(embed);
	} else {
		const num1 = (page * 2048);
		const num2 = num1 + 2048;
		const embed = new MessageEmbed()
			.setTitle(title)
			.setURL(info.url)
			.setDescription(info.lyrics.substring(num1, num2))
			.setTimestamp();
		msg.edit(embed);
	}
}

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
	async run(bot, message, args, settings) {
		// Check that a song is being played
		let options;
		if (args.length == 0) {
			// Check if a song is playing and use that song
			const player = bot.manager.players.get(message.guild.id);
			if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));
			options = {
				apiKey: bot.config.api_keys.genuis,
				title: player.queue.current.title,
				artist: '',
				optimizeQuery: true,
			};
		} else {
			// Use the args for song search
			options = {
				apiKey: bot.config.api_keys.genuis,
				title: args.join(' '),
				artist: '',
				optimizeQuery: true,
			};
		}

		const wait = await message.channel.send('Searching for lyrics');
		// search for and send lyrics
		try {
			const info = await getSong(options);
			const embed = new MessageEmbed()
				.setTitle(options.title)
				.setURL(info.url)
				.setDescription(info.lyrics.substring(0, 2048))
				.setTimestamp()
				.setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));
			message.channel.send(embed).then(async (msg) => {
				// If the song is less than 2048 no point adding reactions
				if (info.lyrics.length < 2048) return;

				// Check if bot has permission to connect to voice channel
				if (!message.channel.permissionsFor(message.guild.me).has('ADD_REACTIONS')) {
					bot.logger.error(`Missing permission: \`ADD_REACTIONS\` in [${message.guild.id}].`);
					return message.error(settings.Language, 'MISSING_PERMISSION', 'ADD_REACTIONS').then(m => m.delete({ timeout: 10000 }));
				}

				// Check if bot has permission to delete emojis
				if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) {
					bot.logger.error(`Missing permission: \`MANAGE_MESSAGES\` in [${message.guild.id}].`);
					return message.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_MESSAGES').then(m => m.delete({ timeout: 10000 }));
				}

				// send reactions so user can see more lyrcis
				await msg.react('⬆');
				await msg.react('⬇');

				let page = 0;
				const filter = (reaction, user) => {
					return ['⬆', '⬇'].includes(reaction.emoji.name) && !user.bot;
				};
				const collector = msg.createReactionCollector(filter, { time: 240000 });
				collector.on('collect', (reaction) => {
					const totalpages = Math.round(info.lyrics.length / 2048);
					if (reaction.emoji.name === '⬆') {
						// back page
						page = page - 1;
						if (page <= 0) page = 0;
						Page(page, msg, options.title, info);
					} else {
						// forward page
						page = page + 1;
						if (page >= totalpages) page = totalpages;
						Page(page, msg, options.title, info);
					}
				});
			}).catch(e => console.log(e));
			wait.delete();
		} catch (err) {
			wait.delete();
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
