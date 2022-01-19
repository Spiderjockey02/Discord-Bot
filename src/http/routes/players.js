// Dependencies
const express = require('express'),
	{ Embed } = require('../../utils'),
	router = express.Router();

// Guild page
module.exports = (bot) => {
	// Get information of the player
	router.get('/:guildId', async (req, res) => {
		const player = bot.manager?.players.get(req.params.guildId);
		if (player) {
			res.status(200).json({
				voiceChannel: player.voiceChannel,
				textChannel: player.textChannel,
				filters: {
					speed: player.speed,
					bassboost: player.bassboost,
					nightcore: player.nightcore,
					vaporwave: player.vaporwave,
				},
				volume: player.volume,
				queue: [player.queue.current, ...player.queue] });
		} else {
			// fetch guild's basic information
			res.status(400).json({ error: 'No music playing in that guild.' });
		}
	});

	// Skips the song
	router.get('/:guildId/skip', (req, res) => {
		const player = bot.manager?.players.get(req.params.guildId);
		if (player) {
			// update player
			player.stop();
			res.status(200).json({ success: 'Successfully skipped song!' });
		} else {
			// fetch guild's basic information
			res.status(400).json({ error: 'No music playing in that guild.' });
		}
	});

	// Change volume of the song
	router.get('/:guildId/volume', (req, res) => {
		const player = bot.manager?.players.get(req.params.guildId);
		if (player) {
			const volume = req.query.num;
			if (volume && Number(volume) > 0 && Number(volume) < 1000) {
				player.setVolume(Number(volume));
				res.status(200).json({ success: 'Successfully updated player\'s volume!' });
			} else {
				res.status(400).json({ error: 'Please specify a volume.' });
			}
		} else {
			// fetch guild's basic information
			res.status(400).json({ error: 'No music playing in that guild.' });
		}
	});

	// updated player's filters
	router.get('/:guildId/filter', (req, res) => {
		const player = bot.manager?.players.get(req.params.guildId);
		if (player) {
			let filter = req.query.option;
			if (['nightcore', 'bassboost', 'vaporwave', 'speed'].includes(filter)) {
				filter = `set${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
				if (['bassboost', 'speed'].includes(filter)) {
					if (req.query.value && (Number(req.query.value) > 0)) {
						player[filter](req.query.value);
					} else {
						return res.status(400).json({ error: `Value for ${req.query.option} must be a number larger than 0.` });
					}
				} else {
					player[filter](`!player.${filter}`);
				}
				res.status(200).json({ success: 'Successfully updated player\'s volume!' });
			} else {
				res.status(400).json({ error: 'Please specify a filter to update.' });
			}
		} else {
			res.status(400).json({ error: 'No music playing in that guild.' });
		}
	});

	// Pause the song
	router.get('/:guildId/pause', (req, res) => {
		const player = bot.manager?.players.get(req.params.guildId);
		if (player) {
			player.pause(true);
		} else {
			res.status(400).json({ error: 'No music playing in that guild.' });
		}
	});

	// Resume the song
	router.get('/:guildId/resume', (req, res) => {
		const player = bot.manager?.players.get(req.params.guildId);
		if (player) {
			player.pause(false);
		} else {
			res.status(400).json({ error: 'No music playing in that guild.' });
		}
	});

	// Add a song to the queue
	router.get('/:guildId/add', async (req, res) => {
		const player = bot.manager?.players.get(req.params.guildId);
		if (player) {
			const guild = bot.guilds.cache.get(req.params.guildId),
				data = await player.search(req.query.song, bot.users.cache.get(req.query.user));
			// if song failed to be loaded
			if (data.loadType === 'LOAD_FAILED') return res.status(400).json({ error: res.exception });

			// Workout what to do with the results
			if (data.loadType == 'NO_MATCHES') {
				// An error occured or couldn't find the track
				if (!player.queue.current) player.destroy();
				return res.status(400).json({ error: guild.translate('music/play:NO_SONG') });

			} else if (data.loadType == 'PLAYLIST_LOADED') {
				// Connect to voice channel if not already
				if (player.state !== 'CONNECTED') player.connect();

				// Show how many songs have been added
				const embed = new Embed(bot, guild)
					.setColor(guild.members.cache.get(req.query.user)?.displayHexColor ?? 'RANDOM')
					.setDescription(guild.translate('music/play:QUEUED', { NUM: data.tracks.length }));
				bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] });

				// Add songs to queue and then pLay the song(s) if not already
				player.queue.add(data.tracks);
				if (!player.playing && !player.paused && player.queue.totalSize === data.tracks.length) player.play();
				res.status(200).json({ success: `Added ${data.tracks.length} songs to the queue.` });
			} else {
				// add track to queue and play
				if (player.state !== 'CONNECTED') player.connect();
				player.queue.add(data.tracks[0]);
				if (!player.playing && !player.paused && !player.queue.size) {
					player.play();
				} else {
					const embed = new Embed(bot, guild)
						.setColor(guild.members.cache.get(req.query.user)?.displayHexColor ?? 'RANDOM')
						.setDescription(guild.translate('music/play:SONG_ADD', { TITLE: data.tracks[0].title, URL: data.tracks[0].uri }));
					bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] });
				}
				res.status(200).json({ success: `Added ${data.tracks[0].title} to the queue.` });
			}
		} else {
			res.status(400).json({ error: 'No music playing in that guild.' });
		}
	});

	// Remove a song from the queue
	router.get('/:guildId/remove', (req, res) => {
		const player = bot.manager?.players.get(req.params.guildId);
		if (player) {
			const guild = bot.guilds.cache.get(req.params.guildId),
				startNum = req.query.start,
				endNum = req.query.end;
			if (!endNum) {
				if (startNum == 0) return res.status(400).json({ error: 'Cannot remove a song that is already playing.' });
				if (startNum > player.queue.length) return res.status(400).json({ error: `There are only ${player.queue.size} songs.` });

				// Removed a song
				const { title } = player.queue[startNum - 1];
				player.queue.splice(startNum - 1, 1);
				res.status(200).json({ success: `Removed ${title} from the queue` });
				bot.channels.cache.get(player.textChannel)?.send(guild.translate('music/remove:REMOVED', { TITLE: title }));
			} else {
				if (startNum == 0 || endNum == 0) return res.status(400).json({ error: 'Cannot remove a song that is already playing.' });
				if (startNum > player.queue.length || endNum > player.queue.length) return res.status(400).json({ error: `There are only ${player.queue.size} songs.` });
				if (startNum > endNum) return res.status(400).json({ error: 'End number must be bigger than start number.' });

				const songsToRemove = endNum - startNum;
				player.queue.splice(startNum - 1, songsToRemove + 1);
				res.status(200).json({ success: `Removed ${songsToRemove + 1} songs from the queue` });
				return bot.channels.cache.get(player.textChannel)?.send(guild.translate('music/remove:REMOVED_MULTI', { NUM: songsToRemove + 1 }));
			}
		} else {
			res.status(400).json({ error: 'No music playing in that guild.' });
		}
	});
	return router;
};
