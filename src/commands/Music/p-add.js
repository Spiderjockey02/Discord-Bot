// Dependecies
const { PlaylistSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class PAdd extends Command {
	constructor(bot) {
		super(bot, {
			name: 'p-add',
			dirname: __dirname,
			aliases: ['playlist-add'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Add a song to the playlist',
			usage: 'p-add <playlist name> <song>',
			cooldown: 3000,
			examples: ['p-add Songs https://www.youtube.com/watch?v=4AnmemzByVY'],
		});
	}

	async run(bot, message, settings) {
		// make sure something was entered
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		PlaylistSchema.findOne({
			name: message.args[0],
			creator: message.author.id,
		}, async (err, p) => {
			// if an error occured
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}

			// playlist found
			if (p) {
				// Get songs to add to playlist
				let res;
				try {
					res = await bot.manager.search(message.args[1], message.author);
				} catch (err) {
					return message.channel.error(settings.Language, 'MUSIC/ERROR', err.message);
				}

				// Workout what to do with the results
				if (res.loadType == 'NO_MATCHES') {
					// An error occured or couldn't find the track
					return message.channel.error(settings.Language, 'MUSIC/NO_SONG');
				} else if (res.loadType == 'PLAYLIST_LOADED' || res.loadType == 'TRACK_LOADED') {
					try {
						const newTracks = res.tracks.slice(0, (message.author.premium ? 200 : 100) - p.songs.length);
						p.songs.push(...newTracks);
						p.duration = parseInt(p.duration) + parseInt(res.tracks.reduce((prev, curr) => prev + curr.duration, 0));
						await p.save();
					} catch (err) {
						if (message.deletable) message.delete();
						bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
						message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
					}
				} else {
					message.channel.send('Something strange happened');
				}
			} else {
				message.channel.send('No playlist found');
			}
		});
	}
};
