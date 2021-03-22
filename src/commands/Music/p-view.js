// Dependecies
const ms = require('../../utils/timeFormatter'),
	{ MessageEmbed } = require('discord.js'),
	{ Playlist } = require('../../modules/database/models'),
	Command = require('../../structures/Command.js'),
	paginate = require('../../utils/pagenator'),
	MS = new ms;

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
		});
	}

	async run(bot, message, args) {
		Playlist.findOne({
			name: args[0],
			creator: message.author.id,
		}, async (err, p) => {
			if (err) bot.logger.error(err.message);
			if (!p) {
				const embed = new MessageEmbed()
					.setAuthor(p.name, message.author.displayAvatarURL())
					.setDescription(`Couldn't find a playlist by the name ${p.name}.`)
					.setTimestamp();
				return message.channel.send(embed);
			} else {
				let pagesNum = Math.ceil(p.songs.length / 10);
				if (pagesNum === 0) pagesNum = 1;

				let totalQueueDuration = 0;
				for(let i = 0; i < p.songs.length; i++) {
					totalQueueDuration += p.songs[i].duration;
				}

				const pages = [];
				let n = 1;
				for (let i = 0; i < pagesNum; i++) {
					const str = `${p.songs.slice(i * 10, i * 10 + 10).map(song => `**${n++}.** [${song.title}](https://www.youtube.com/watch?v=${song.identifier}) \`[${MS.getReadableTime(song.duration)}]\``).join('\n')}`;
					const embed = new MessageEmbed()
						.setAuthor(message.author.tag, message.author.displayAvatarURL())
						.setThumbnail(message.author.displayAvatarURL())
						.setTitle(p.name)
						.setDescription(str)
						.setFooter(`ID: ${p._id}`)
						.setTimestamp()
						.setFooter(`Page ${i + 1}/${pagesNum} | ${p.songs.length} songs | ${MS.getReadableTime(totalQueueDuration)} total duration`);
					pages.push(embed);
					if (i == pagesNum - 1 && pagesNum > 1) paginate(bot, message, pages, ['◀️', '▶️'], 120000, p.songs.length, MS.getReadableTime(totalQueueDuration));
					else if(pagesNum == 1) message.channel.send(embed);
				}
			}
		});
	}
};
