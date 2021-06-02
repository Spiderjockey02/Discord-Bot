// Dependecies
const	{ Embed } = require('../../utils'),
	{ PlaylistSchema } = require('../../database/models'),
	{ time: { getReadableTime } } = require('../../utils'),
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

	async run(bot, message, settings) {

		if (!message.args[1]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/p-create:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		if (message.args[0].length > 32) return msg.edit(message.translate('music/p-create:TOO_LONG'));

		const msg = await message.channel.send(message.translate('music/p-create:WAITING'));

		PlaylistSchema.find({
			creator: message.author.id,
		}, async (err, p) => {
			// if an error occured
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}

			// response from database
			if (!p[0]) {
				await this.savePlaylist(bot, message, settings, msg);
			} else if (p[0] && !message.author.premium) {
				// User needs premium to save more playlists
				return msg.edit(message.translate('music/p-create:NO_PREM'));
			} else if (p.length >= 3 && message.author.premium) {
				// there is a max of 3 playlists per a user even with premium
				return msg.edit(message.translate('music/p-create:MAX_PLAYLISTS'));
			} else if (p && message.author.premium) {
				// user can have save another playlist as they have premium
				const exist = p.find(obj => obj.name == message.args[0]);
				if (!exist) {
					await this.savePlaylist(bot, message, message.args, settings, msg);
				} else {
					msg.edit(message.translate('music/p-create:EXISTS'));
				}
			}
		});
	}

	// Check and save playlist to database
	async savePlaylist(bot, message, settings, msg) {
		// Get songs to add to playlist
		let res;
		try {
			res = await bot.manager.search(message.args.slice(1).join(' '), message.author);
		} catch (err) {
			return message.channel.error('music/play:ERROR', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}

		// Workout what to do with the results
		if (res.loadType == 'NO_MATCHES') {
			// An error occured or couldn't find the track
			msg.delete();
			return message.channel.error('music/play:NO_SONG');
		} else if (res.loadType == 'PLAYLIST_LOADED' || res.loadType == 'TRACK_LOADED' || res.loadType == 'SEARCH_RESULT') {
			let tracks = [], thumbnail, duration;
			if (res.loadType == 'SEARCH_RESULT') {
				// Display the options for search
				let max = 10, collected;
				const filter = (m) => m.author.id === message.author.id && /^(\d+|cancel)$/i.test(m.content);
				if (res.tracks.length < max) max = res.tracks.length;

				const results = res.tracks.slice(0, max).map((track, index) => `${++index} - \`${track.title}\``).join('\n');
				const embed = new Embed(bot, message.guild)
					.setTitle('music/search:TITLE', { TITLE: message.args.join(' ') })
					.setColor(message.member.displayHexColor)
					.setDescription(message.translate('music/search:DESC', { RESULTS: results }));
				const search = await message.channel.send(embed);

				try {
					collected = await message.channel.awaitMessages(filter, { max: 1, time: 30e3, errors: ['time'] });
				} catch (e) {
					return message.reply(message.translate('misc:WAITED_TOO_LONG'));
				}

				const first = collected.first().content;
				if (first.toLowerCase() === 'cancel') {
					return message.channel.send(message.translate('misc:CANCELLED'));
				}

				const index = Number(first) - 1;
				if (index < 0 || index > max - 1) return message.reply(message.translate('music/search:INVALID', { NUM: max }));

				tracks.push(res.tracks[index]);
				thumbnail = res.tracks[index].thumbnail;
				duration = res.tracks[index].duration;
				search.delete();
			} else {
				tracks = res.tracks.slice(0, message.author.premium ? 200 : 100);
				thumbnail = res.playlist?.selectedTrack.thumbnail ?? res.tracks[0].thumbnail;
				duration = res.playlist?.duration ?? res.tracks[0].duration;
			}

			// Save playlist to database
			const newPlaylist = new PlaylistSchema({
				name: message.args[0],
				songs: tracks,
				timeCreated: Date.now(),
				thumbnail: thumbnail,
				creator: message.author.id,
				duration: duration,
			});
			newPlaylist.save().catch(err => bot.logger.error(err.message));

			// Show that playlist has been saved
			const embed = new Embed(bot, message.guild)
				.setAuthor(newPlaylist.name, message.author.displayAvatarURL())
				.setDescription([
					message.translate('music/p-create:DESC_1', { TITLE: message.args[0] }),
					message.translate('music/p-create:DESC_2', { NUM: getReadableTime(parseInt(newPlaylist.duration)) }),
					message.translate('music/p-create:DESC_3', { NAME: (res.loadType == 'PLAYLIST_LOADED') ? res.playlist.name : tracks[0].title, NUM: tracks.length, TITLE: message.args[0] }),
				].join('\n'))
				.setFooter('music/p-create:FOOTER', { ID: newPlaylist._id, NUM: newPlaylist.songs.length, PREM: (message.author.premium) ? '200' : '100' })
				.setTimestamp();
			msg.edit('', embed);
		} else {
			msg.delete();
			return message.channel.error('music/p-create:NO_SONG');
		}
	}
};
