import { BaseGuildTextChannel, Guild, GuildTextBasedChannel, User } from 'discord.js';
import { Router } from 'express';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../structures';
const router = Router();

export function run(client: EgglordClient) {
	// Get information of the player
	router.get('/:guildId', async (req, res) => {
		const player = client.audioManager?.players.get(req.params.guildId);
		if (!player) return res.status(400).json({ error: 'No music playing in that guild.' });

		res.status(200).json({
			voiceChannel: player.voiceChannel,
			textChannel: player.textChannel,
			filters: {
				speed: player.filters.timescale,
				bassboost: player.filters.getFilterStatus('bassboost'),
				nightcore: player.filters.getFilterStatus('nightcore'),
				vaporwave: player.filters.getFilterStatus('vaporwave'),
			},
			volume: player.volume,
			queue: [player.queue.current, ...player.queue] });
	});

	// Skips the song
	router.get('/:guildId/skip', (req, res) => {
		const player = client.audioManager?.players.get(req.params.guildId);
		if (!player) return res.status(400).json({ error: 'No music playing in that guild.' });

		// update player
		player.stop();
		res.status(200).json({ success: 'Successfully skipped song!' });
	});

	// Change volume of the song
	router.get('/:guildId/volume', (req, res) => {
		const player = client.audioManager?.players.get(req.params.guildId);
		if (!player) return res.status(400).json({ error: 'No music playing in that guild.' });

		const volume = req.query.num;
		if (volume && Number(volume) > 0 && Number(volume) < 1000) {
			player.setVolume(Number(volume));
			res.status(200).json({ success: 'Successfully updated player\'s volume!' });
		} else {
			res.status(400).json({ error: 'Please specify a volume.' });
		}
	});

	// updated player's filters
	router.get('/:guildId/filter', (req, res) => {
		const player = client.audioManager?.players.get(req.params.guildId);
		if (!player) return res.status(400).json({ error: 'No music playing in that guild.' });

		const filter = req.query.option;
		if (typeof filter !== 'string') return res.json({ error: 'Invalid song' });

		const filters = ['nightcore', 'bassboost', 'vaporwave', 'clearFilters', 'distort', ' eightD'];
		if (!filters.includes(filter)) return res.json({ error: `Please select one of the following filters: ${filters.join(', ')}.` });

		// @ts-expect-error Funky stuff please ignore
		player.filters[filter]();
	});

	// Pause the song
	router.get('/:guildId/pause', (req, res) => {
		const player = client.audioManager?.players.get(req.params.guildId);
		if (!player) return res.status(400).json({ error: 'No music playing in that guild.' });

		player.pause(true);
	});

	// Resume the song
	router.get('/:guildId/resume', (req, res) => {
		const player = client.audioManager?.players.get(req.params.guildId);
		if (!player) return res.status(400).json({ error: 'No music playing in that guild.' });

		player.pause(false);
	});

	// Add a song to the queue
	router.get('/:guildId/add', async (req, res) => {
		const player = client.audioManager?.players.get(req.params.guildId);
		if (!player) return res.status(400).json({ error: 'No music playing in that guild.' });

		const guild = client.guilds.cache.get(req.params.guildId) as Guild,
			songQuery = req.query.song,
			userQuery = req.query.user;

		// Validate queries
		if (typeof songQuery !== 'string') return res.json({ error: 'Invalid song' });
		if (typeof userQuery !== 'string' || isNaN(parseInt(userQuery, 10))) return res.json({ error: 'Invalid userId' });
		const song = songQuery,
			user = client.users.cache.get(userQuery) as User;

		// Search for song
		const result = await player.search(song, user);
		switch (result.loadType) {
			case 'error':
				return res.status(400).json({ error: 'Error searching for song.' });
			case 'empty':
				// An error occured or couldn't find the track
				if (!player.queue.current) player.destroy();
				return res.status(400).json({ error: client.languageManager.translate(guild, 'music/play:NO_SONG') });
			case 'playlist':
				if (player.state !== 'CONNECTED') player.connect();

				// Add songs to queue and then pLay the song(s) if not already
				player.queue.add(result.tracks);
				if (!player.playing && !player.paused && player.queue.totalSize === result.tracks.length) player.play();

				if (player.textChannel) {
					const textChannel = guild.channels.cache.get(player.textChannel) as GuildTextBasedChannel;
					const embed = new EgglordEmbed(client, guild)
						.setColor(guild.members.cache.get(user.id)?.displayHexColor ?? client.config.embedColor)
						.setDescription(
							client.languageManager.translate(guild, 'music/play:QUEUED', { NUM: result.tracks.length }),
						);

					textChannel.send({ embeds: [embed] });
				}

				res.status(200).json({ success: `Added ${result.tracks.length} songs to the queue.` });
				break;
			default:
				// add track to queue and play
				if (player.state !== 'CONNECTED') player.connect();
				player.queue.add(result.tracks[0]);
				if (!player.playing && !player.paused && !player.queue.size) {
					player.play();
				} else if (player.textChannel) {
					const textChannel = guild.channels.cache.get(player.textChannel) as GuildTextBasedChannel;
					const embed = new EgglordEmbed(client, guild)
						.setColor(guild.members.cache.get(user.id)?.displayHexColor ?? client.config.embedColor)
						.setDescription(
							client.languageManager.translate(guild, 'music/play:SONG_ADD', { TITLE: result.tracks[0].title, URL: result.tracks[0].uri }),
						);

					textChannel.send({ embeds: [embed] });
				}
				res.status(200).json({ success: `Added ${result.tracks[0].title} to the queue.` });
		}
	});

	// Remove a song from the queue
	router.get('/:guildId/remove', (req, res) => {
		// Get player
		const player = client.audioManager?.players.get(req.params.guildId);
		if (!player) return res.status(400).json({ error: 'No music playing in that guild.' });

		// Get queries
		const guild = client.guilds.cache.get(req.params.guildId) as Guild,
			startQuery = req.query.start,
			endQuery = req.query.end;

		// Validate
		if (typeof startQuery !== 'string' || isNaN(parseInt(startQuery, 10))) return res.json({ error: 'Missng start query' });
		const startNum = parseInt(startQuery, 10);

		if (endQuery == undefined) {
			if (startNum == 0) return res.status(400).json({ error: 'Cannot remove a song that is already playing.' });
			if (startNum > player.queue.length) return res.status(400).json({ error: `There are only ${player.queue.size} songs.` });

			// Removed a song
			const { title } = player.queue[startNum - 1];
			player.queue.splice(startNum - 1, 1);

			// Send back response
			res.status(200).json({ success: `Removed ${title} from the queue` });
			if (player.textChannel) {
				const textChannel = client.channels.cache.get(player.textChannel) as BaseGuildTextChannel;
				textChannel?.send({
					content: client.languageManager.translate(guild, 'music/remove:REMOVED', { TITLE: title }),
				});
			}
		} else {
			// Validate
			if (typeof endQuery !== 'string' || isNaN(parseInt(endQuery, 10))) return res.json({ error: 'Incorrect end query' });
			const endNum = parseInt(startQuery, 10);

			// Validate inputs against queue
			if (startNum == 0 || endNum == 0) return res.status(400).json({ error: 'Cannot remove a song that is already playing.' });
			if (startNum > player.queue.length || endNum > player.queue.length) return res.status(400).json({ error: `There are only ${player.queue.size} songs.` });
			if (startNum > endNum) return res.status(400).json({ error: 'End number must be bigger than start number.' });

			// Remove from queue
			const songsToRemove = endNum - startNum;
			player.queue.splice(startNum - 1, songsToRemove + 1);

			// Send back response
			res.status(200).json({ success: `Removed ${songsToRemove + 1} songs from the queue` });
			if (player.textChannel) {
				const textChannel = client.channels.cache.get(player.textChannel) as BaseGuildTextChannel;
				textChannel?.send({
					content: client.languageManager.translate(guild, 'music/remove:REMOVED_MULTI', { NUM: songsToRemove + 1 }),
				});
			}
		}
	});

	return router;
}
