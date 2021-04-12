// Dependecies
const	{ MessageEmbed } = require('discord.js'),
	{ PlaylistSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

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
			examples: ['p-create Songs https://www.youtube.com/watch?v=N3vY6yvHLdc&list=PLUhFQlEQDZOfDqu5eZUvwUs7EEcPpeVbB'],
		});
	}

	async run(bot, message, args, settings) {

		if (!args[1]) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		if (args[0].length > 32) return msg.edit('Playlist title must be less than 32 characters!');

		const msg = await message.channel.send('Adding song(s) to your playlist (This might take a few seconds.)...');

		PlaylistSchema.find({
			creator: message.author.id,
		}, async (err, p) => {
			// if an error occured
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}

			// response from database
			if (!p[0]) {
				await this.savePlaylist(bot, message, args, settings, msg);
			} else if (p[0] && !message.author.premium) {
				// User needs premium to save more playlists
				return msg.edit('Premium allows you to save up to 3 playlists instead of 1.');
			} else if (p.length >= 3 && message.author.premium) {
				// there is a max of 3 playlists per a user even with premium
				return msg.edit('You are unable to save anymore playlists. Max: 3');
			} else if (p && message.author.premium) {
				// user can have save another playlist as they have premium
				const exist = p.find(obj => obj.name == args[0]);
				if (!exist) {
					await this.savePlaylist(bot, message, args, settings, msg);
				} else {
					msg.edit('A playlist already exists with that name.');
				}
			}
		});
	}

	// Check and save playlist to database
	async savePlaylist(bot, message, args, settings, msg) {
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
		} else if (res.loadType == 'PLAYLIST_LOADED' || res.loadType == 'TRACK_LOADED') {
			// Save playlist to database
			const newPlaylist = new PlaylistSchema({
				name: args[0],
				songs: res.tracks.slice(0, message.author.premium ? 100 : 200),
				timeCreated: Date.now(),
				thumbnail: res.playlist?.selectedTrack.thumbnail ?? res.tracks[0].thumbnail,
				creator: message.author.id,
				duration: res.playlist?.duration ?? res.tracks[0].duration,
			});
			newPlaylist.save().catch(err => bot.logger.error(err.message));

			// Show that playlist has been saved
			const embed = new MessageEmbed()
				.setAuthor(newPlaylist.name, message.author.displayAvatarURL())
				.setDescription([	`Created a playlist with name: **${args[0]}**.`,
					`Playlist duration: ${bot.timeFormatter.getReadableTime(parseInt(newPlaylist.duration))}.`,
					`Added **${(res.loadType == 'PLAYLIST_LOADED') ? res.playlist.name : res.tracks[0].title}** (${res.tracks.length} tracks) to **${args[0]}**.`].join('\n'))
				.setFooter(`ID: ${newPlaylist._id} • Songs: ${newPlaylist.songs.length}/${(message.author.premium) ? '100' : '200'}`)
				.setTimestamp();
			msg.edit('', embed);
		} else {
			msg.delete();
			return message.channel.send(`\`${args[1]}\` is not a playlist`);
		}
	}
};
