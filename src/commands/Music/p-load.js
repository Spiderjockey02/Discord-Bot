// Dependencies
const	{ Embed } = require('../../utils'),
	{ PlaylistSchema } = require('../../database/models'),
	{ TrackUtils } = require('erela.js'),
	Command = require('../../structures/Command.js');

/**
 * playlist load command
 * @extends {Command}
*/
class PLoad extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'p-load',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['playlist-load'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
			description: 'Load a playlist',
			usage: 'p-load <playlist name>',
			cooldown: 3000,
			examples: ['p-load Songs'],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message, settings) {
		// make sure a playlist name was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/p-load:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
			}
		}

		// make sure user is in a voice channel
		if (!message.member.voice.channel) return message.channel.error('music/play:NOT_VC');

		// Check that user is in the same voice channel
		if (bot.manager?.players.get(message.guild.id)) {
			if (message.member.voice.channel.id != bot.manager?.players.get(message.guild.id).voiceChannel) return message.channel.error('misc:NOT_VOICE').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// Check if VC is full and bot can't join doesn't have (MANAGE_CHANNELS)
		if (message.member.voice.channel.full && !message.member.voice.channel.permissionsFor(message.guild.me).has('MOVE_MEMBERS')) {
			return message.channel.error('music/play:VC_FULL').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// send waiting message
		const msg = await message.channel.send('Loading playlist (This might take a few seconds)...');

		// interact with database
		PlaylistSchema.findOne({
			name: message.args[0],
			creator: message.author.id,
		}, async (err, p) => {
			// if an error occured
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			if (p) {
				// Create player
				let player;
				try {
					player = bot.manager.create({
						guild: message.guild.id,
						voiceChannel: message.member.voice.channel.id,
						textChannel: message.channel.id,
						selfDeafen: true,
					});
					player.connect();
				} catch (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}

				// add songs to queue
				// eslint-disable-next-line no-async-promise-executor
				const content = new Promise(async function(resolve) {
					for (let i = 0; i < p.songs.length; i++) {
						player.queue.add(TrackUtils.buildUnresolved({
							title: p.songs[i].title,
							author: p.songs[i].author,
							duration: p.songs[i].duration,
						}, message.author));
						if (!player.playing && !player.paused && !player.queue.length) player.play();
						if (i == p.songs.length - 1) resolve();
					}
				});

				content.then(async function() {
					const embed = new Embed(bot, message.guild)
						.setDescription(message.translate('music/p-load:QUEUE', { NUM: p.songs.length, TITLE: message.args[0] }));
					msg.edit({ embeds: [embed] });
				});
			} else {
				msg.edit(message.translate('music/p-load:NO_PLAYLIST'));
			}
		});
	}
}

module.exports = PLoad;
