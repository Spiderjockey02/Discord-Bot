// Dependecies
const ms = require('../../utils/timeFormatter'),
	{ MessageEmbed } = require('discord.js'),
	{ Playlist } = require('../../modules/database/models'),
	Command = require('../../structures/Command.js'),
	MS = new ms;

module.exports = class PCreate extends Command {
	constructor(bot) {
		super(bot, {
			name: 'p-create',
			dirname: __dirname,
			aliases: ['playlist-create'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a playlist',
			usage: 'p-create <playlist name> <search query/link>',
			cooldown: 3000,
		});
	}

	async run(bot, message, args, settings) {

		if (!args[1]) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		if (args[0].length > 32) return msg.edit('Playlist title must be less than 32 characters!');

		const msg = await message.channel.send('Adding song(s) to your playlist (This might take a few seconds.)...');

		Playlist.findOne({
			name: args[0],
			creator: message.author.id,
		}, async (err, p) => {
			if (err) bot.logger.error(err.message);
			if (!p) {
				// Get songs to add to playlist
				let res;
				try {
					res = await bot.manager.search(args[1], message.author);
				} catch (err) {
					return message.error(settings.Language, 'MUSIC/ERROR', err.message);
				}

				// Workout what to do with the results
				if (res.loadType == 'NO_MATCHES') {
					// An error occured or couldn't find the track
					msg.delete();
					return message.error(settings.Language, 'MUSIC/NO_SONG');
				} else if (res.loadType == 'PLAYLIST_LOADED') {
					// Save playlist to database
					const newPlaylist = new Playlist({
						name: args[0],
						songs: res.tracks,
						timeCreated: Date.now(),
						thumbnail: res.playlist.selectedTrack.thumbnail,
						creator: message.author.id,
						duration: res.playlist.duration,
					});
					newPlaylist.save().catch(err => bot.logger.error(err.message));

					// Show that playlist has been saved
					const embed = new MessageEmbed()
						.setAuthor(newPlaylist.name, message.author.displayAvatarURL())
						.setDescription([	`Created a playlist with name: **${args[0]}**.`,
							`Playlist duration: ${MS.getReadableTime(res.playlist.duration)}.`,
							`Added **${res.playlist.name}** (${res.tracks.length} tracks) to **${args[0]}**.`].join('\n'))
						.setFooter(`ID: ${newPlaylist._id} • Songs: ${newPlaylist.songs.length}/100`)
						.setTimestamp();
					msg.edit('', embed);
				} else {
					msg.delete();
					return message.channel.send(`\`${args[1]}\` is not a plylist / or a playlist could not be found`);
				}
			} else {
				message.channel.send('A playlist already exists with that name in this guild.');
			}
		});
	}
};
