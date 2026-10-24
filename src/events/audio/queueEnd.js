// Dependencies
const { EmbedBuilder } = require('discord.js'),
	{ Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Queue end event
 * @event AudioManager#QueueEnd
 * @extends {Event}
*/
class QueueEnd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			child: 'manager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that's queue ended
	 * @param {Track} track The track that just ended causing the queue to end aswell.
	 * @readonly
	*/
	async run(bot, player, track) {
		const { requester } = track;
		// Whether or not auto play is enabled
		if (player.autoplay) {
			// Search for track
			const channel = bot.channels.cache.get(player.textChannel);
			const guild = bot.guilds.cache.get(player.guild);
			let res;
			try {
				const videoID = await this.getVideoID(player, track);
				if (!videoID) throw new Error('Couldn\'t find a related song on YouTube.');
				res = await player.search(`https://www.youtube.com/watch?v=${videoID}&list=RD${videoID}`, requester);
				if (res.loadType === 'error') {
					if (!player.queue.current) player.destroy();
					throw res.exception;
				}
				// The mix starts with the song that just ended
				res.tracks = res.tracks.filter(({ identifier }) => identifier !== videoID);
				if (!res.tracks.length) res.loadType = 'empty';
			} catch (err) {
				// Nothing to autoplay, so leave once the player has been idle for a while
				this.leaveWhenIdle(bot, player);
				return channel?.error('music/play:ERROR', { ERROR: err.message });
			}

			switch (res.loadType) {
				case 'empty':
				// An error occured or couldn't find the track
					if (!player.queue.current) player.destroy();
					return channel?.error('music/play:NO_SONG');
				case 'playlist': {
				// Connect to voice channel if not already
					if (player.state !== 'CONNECTED') player.connect();

					// Show how many songs have been added
					const embed = new Embed(bot, guild)
						.setColor(guild.members.cache.get(requester.id)?.displayHexColor)
						.setDescription(guild.translate('music/play:QUEUED', { NUM: res.tracks.length }));
					channel.send({ embeds: [embed] });

					// Add songs to queue and then pLay the song(s) if not already
					player.queue.add(res.tracks);
					if (!player.playing && !player.paused) player.play();
					break;
				}
				default:
				// add track to queue and play
					if (player.state !== 'CONNECTED') player.connect();
					player.queue.add(res.tracks[0]);
					if (!player.playing && !player.paused && !player.queue.size) {
						player.play();
					} else {
						const embed = new Embed(bot, guild)
							.setColor(guild.members.cache.get(requester.id)?.displayHexColor)
							.setDescription(guild.translate('music/play:SONG_ADD', { TITLE: res.tracks[0].title, URL: res.tracks[0].uri }));
						channel.send({ embeds: [embed] });
					}
			}
		} else {
			// When the queue has finished
			this.leaveWhenIdle(bot, player);
		}
	}

	/**
	 * Leaves the voice channel after 3 minutes without music, unless 24/7 mode is on.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that's queue ended
	*/
	leaveWhenIdle(bot, player) {
		clearTimeout(player.timeout);
		player.timeout = setTimeout(() => {
			// Don't leave channel if 24/7 mode is active
			if (player.twentyFourSeven || player.destroyed || player.queue.current) return;
			const vcName = bot.channels.cache.get(player.voiceChannel)?.name ?? 'unknown';
			const embed = new EmbedBuilder()
				.setDescription(bot.guilds.cache.get(player.guild).translate('music/dc:INACTIVE', { VC: vcName }));

			bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 })).catch(() => null);
			player.destroy();
		}, 180000);
	}

	/**
	 * Finds the YouTube video ID for a track, so a YouTube mix can be made from it.
	 * @param {Player} player The player that's queue ended
	 * @param {Track} track The track that ended
	 * @returns {Promise<?string>}
	*/
	async getVideoID(player, track) {
		const youtubeUri = [track.youtubeUri, track.uri].find(uri => /youtu\.?be/i.test(uri || ''));
		if (youtubeUri) {
			const match = youtubeUri.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/);
			if (match) return match[1];
		}

		// Tracks from other services (Tidal, SoundCloud, ...) need to be found on YouTube first
		const res = await player.search(`${track.title} ${track.author}`, track.requester, 'youtube');
		return res.tracks[0]?.identifier ?? null;
	}
}

module.exports = QueueEnd;
