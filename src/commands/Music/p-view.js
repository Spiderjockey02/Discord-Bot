// Dependecies
const	{ MessageEmbed } = require('discord.js'),
	{ PlaylistSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js'),
	paginate = require('../../utils/pagenator');

module.exports = class PView extends Command {
	constructor(bot) {
		super(bot, {
			name: 'p-view',
			dirname: __dirname,
			aliases: ['playlist-view'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'View a playlist',
			usage: 'p-view <playlist name>',
			cooldown: 3000,
			examples: ['p-view Songs'],
		});
	}

	async run(bot, message, settings) {
		// Find all playlists made by the user
		PlaylistSchema.find({
			creator: message.author.id,
		}, async (err, p) => {
			// if an error occured
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}

			if (!p[0]) {
				message.channel.send('You have no playlists saved.');
			} else {
				// Get all playlists name
				const playlistNames = [];
				for (let i = 0; i < p.length; i++) {
					playlistNames.push(p[i].name);
				}

				// no playlist name was entered
				if (!message.args[0]) return message.channel.send(`Available playlists are \`${playlistNames.join('`, `')}\`.`);

				// A valid playlist name was entered
				if (playlistNames.includes(message.args[0])) {
					p = p.find(obj => obj.name == message.args[0]);

					// Show information on that playlist
					let pagesNum = Math.ceil(p.songs.length / 10);
					if (pagesNum === 0) pagesNum = 1;

					let totalQueueDuration = 0;
					for(let i = 0; i < p.songs.length; i++) {
						totalQueueDuration += p.songs[i].duration;
					}

					const pages = [];
					let n = 1;
					for (let i = 0; i < pagesNum; i++) {
						const str = `${p.songs.slice(i * 10, i * 10 + 10).map(song => `**${n++}.** [${song.title}](https://www.youtube.com/watch?v=${song.identifier}) \`[${bot.timeFormatter.getReadableTime(song.duration)}]\``).join('\n')}`;
						const embed = new MessageEmbed()
							.setAuthor(message.author.tag, message.author.displayAvatarURL())
							.setThumbnail(p.thumbnail)
							.setTitle(p.name)
							.setDescription(str)
							.setFooter(`ID: ${p._id}`)
							.setTimestamp()
							.setFooter(`Page ${i + 1}/${pagesNum} | ${p.songs.length} songs | ${bot.timeFormatter.getReadableTime(totalQueueDuration)} total duration`);
						pages.push(embed);
						if (i == pagesNum - 1 && pagesNum > 1) paginate(bot, message, pages);
						else if(pagesNum == 1) message.channel.send(embed);
					}
				} else {
					message.channel.send('That is not a playlist made by you.');
				}
			}
		});
	}
};
