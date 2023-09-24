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
	async run(bot, player, { identifier: videoID, requester }) {
		// Whether or not auto play is enabled
		if (player.autoplay) {
			// Search for track
			const channel = bot.channels.cache.get(player.textChannel);
			const guild = bot.guilds.cache.get(player.guild);
			let res;
			try {
				res = await player.search(`https://www.youtube.com/watch?v=${videoID}&list=RD${videoID};`, requester);
				if (res.loadType === 'error') {
					if (!player.queue.current) player.destroy();
					throw res.exception;
				}
			} catch (err) {
				return channel.error('music/play:ERROR', { ERROR: err.message });
			}

			switch (res.loadType) {
				case 'empty':
				// An error occured or couldn't find the track
					if (!player.queue.current) player.destroy();
					return channel.error('music/play:NO_SONG');
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
					if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
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
			player.timeout = setTimeout(() => {

				// Don't leave channel if 24/7 mode is active
				if (player.twentyFourSeven) return;
				const vcName = bot.channels.cache.get(player.voiceChannel)?.name ?? 'unknown';
				const embed = new EmbedBuilder()
					.setDescription(bot.guilds.cache.get(player.guild).translate('music/dc:INACTIVE', { VC: vcName }));

				bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 }));
				player.destroy();
			}, 180000);
		}
	}
}

module.exports = QueueEnd;
