// Dependencies
const	{ Embed } = require('../../utils'),
	{ PlaylistSchema } = require('../../database/models'),
	{ time: { getReadableTime } } = require('../../utils'),
	{ paginate } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * playlist view command
 * @extends {Command}
*/
class PView extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'p-view',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['playlist-view'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'View a playlist',
			usage: 'p-view <playlist name>',
			cooldown: 3000,
			examples: ['p-view Songs'],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message) {
		// Find all playlists made by the user
		PlaylistSchema.find({
			creator: message.author.id,
		}, async (err, p) => {
			// if an error occured
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			if (!p[0]) {
				message.channel.error('music/p-view:NO_PLAYLIST');
			} else {
				// Get all playlists name
				const playlistNames = p.map(pl => pl.name);

				// no playlist name was entered
				if (!message.args[0]) return message.channel.send(message.translate('music/p-view:AVAIABLE', { NAMES: playlistNames.join('`, `') }));

				// A valid playlist name was entered
				if (playlistNames.includes(message.args[0])) {
					p = p.find(obj => obj.name == message.args[0]);

					// Show information on that playlist
					let pagesNum = Math.ceil(p.songs.length / 10);
					if (pagesNum === 0) pagesNum = 1;

					// Get total playlist duration
					const totalQueueDuration = p.songs.reduce((a, b) => a + b.duration, 0);

					const pages = [];
					let n = 1;
					for (let i = 0; i < pagesNum; i++) {
						const str = `${p.songs.slice(i * 10, i * 10 + 10).map(song => `**${n++}.** ${song.title} \`[${getReadableTime(song.duration)}]\``).join('\n')}`;
						const embed = new Embed(bot, message.guild)
							.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
							.setThumbnail(p.thumbnail)
							.setTitle(p.name)
							.setDescription(str)
							.setTimestamp()
							.setFooter({ text: `Page ${i + 1}/${pagesNum} | ${p.songs.length} songs | ${getReadableTime(totalQueueDuration)} total duration` });
						pages.push(embed);
						if (i == pagesNum - 1 && pagesNum > 1) paginate(bot, message.channel, pages);
						else if (pagesNum == 1) message.channel.send({ embeds: [embed] });
					}
				} else {
					message.channel.error('music/p-view:NO_PLAYLIST');
				}
			}
		});
	}
}

module.exports = PView;
