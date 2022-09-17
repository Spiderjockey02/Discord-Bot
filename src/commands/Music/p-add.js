// Dependencies
const { PlaylistSchema } = require('../../database/models'),
	{ Embed } = require('../../utils'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * playlist add command
 * @extends {Command}
*/
class PAdd extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'p-add',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['playlist-add'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Add a song to the playlist',
			usage: 'p-add <playlist name> <song>',
			cooldown: 3000,
			examples: ['p-add Songs https://www.youtube.com/watch?v=4AnmemzByVY'],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message, settings) {
		// make sure something was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/p-add:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Fetch playlist
		let playlist;
		try {
			playlist = await PlaylistSchema.findOne({
				name: message.args[0],
				creator: message.author.id,
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}


		// playlist found
		if (playlist) {
			// Get songs to add to playlist
			let res;
			try {
				res = await bot.manager.search(message.args.slice(1).join(' '), message.author);
			} catch (err) {
				return message.channel.error('music/p-add:ERROR', { ERROR: err.message });
			}

			// Workout what to do with the results
			if (res.loadType == 'NO_MATCHES') {
				// An error occured or couldn't find the track
				return message.channel.error('music/play:NO_SONG');
			} else if (res.loadType == 'PLAYLIST_LOADED' || res.loadType == 'TRACK_LOADED') {
				try {
					// add songs to playlist
					const newTracks = res.tracks.slice(0, (message.author.premium ? 200 : 100) - playlist.songs.length);
					playlist.songs.push(...newTracks);
					playlist.duration = parseInt(playlist.duration) + parseInt(res.tracks.reduce((prev, curr) => prev + curr.duration, 0));
					await playlist.save();
					message.channel.success('music/p-add:SUCCESS', { NUM: newTracks.length, TITLE: message.args[0] });
				} catch (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}
			}	else if (res.loadType == 'SEARCH_RESULT') {
				// Display the options for search
				let max = 10, collected;
				const filter = (m) => m.author.id === message.author.id && /^(\d+|cancel)$/i.test(m.content);
				if (res.tracks.length < max) max = res.tracks.length;

				const results = res.tracks.slice(0, max).map((track, index) => `${++index} - \`${track.title}\``).join('\n');
				const embed = new Embed(bot, message.guild)
					.setTitle('music/search:TITLE', { TITLE: message.args.join(' ') })
					.setColor(message.member.displayHexColor)
					.setDescription(message.translate('music/search:DESC', { RESULTS: results }));
				message.channel.send({ embeds: [embed] });

				try {
					collected = await message.channel.awaitMessages({ filter, max: 1, time: 30e3, errors: ['time'] });
				} catch (e) {
					return message.reply(message.translate('misc:WAITED_TOO_LONG'));
				}

				const first = collected.first().content;
				if (first.toLowerCase() === 'cancel') {
					return message.channel.send(message.translate('misc:CANCELLED'));
				}

				const index = Number(first) - 1;
				if (index < 0 || index > max - 1) return message.reply(message.translate('music/search:INVALID', { NUM: max }));

				const track = res.tracks[index];
				playlist.songs.push(track);
				playlist.duration = parseInt(playlist.duration) + parseInt(track.duration);
				await playlist.save();
				message.channel.success('music/p-add:SUCCESS', { NUM: 1, TITLE: track.title });
			} else {
				message.channel.error('music/p-add:NO_SONG');
			}
		} else {
			message.channel.error('music/p-add:NO_PLAYLIST', { NAME: message.args[0] });
		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(bot, interaction) {
		interaction.reply({ content: 'This is currently unavailable.' });
	}
}

module.exports = PAdd;
