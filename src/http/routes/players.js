// Dependencies
const express = require('express'),
	router = express.Router();

// Guild page
module.exports = function(bot) {
	// Get information of the player
	router.get('/:guildId', async (req, res) => {
		const player = bot.manager?.players.get(req.params.guildId);
		if (player) {
			res.status(200).json({
				voiceChannel: player.voiceChannel,
				textChannel: player.textChannel,
				filters: {
					speed: 1,
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
	router.get('/:guildId/skip', async (req, res) => {
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
	router.get('/:guildId/volume', async (req, res) => {
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
	router.get('/:guildId/filter', async (req, res) => {
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
			// fetch guild's basic information
			res.status(400).json({ error: 'No music playing in that guild.' });
		}
	});

	return router;
};
