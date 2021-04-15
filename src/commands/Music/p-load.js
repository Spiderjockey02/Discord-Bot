// Dependecies
const	{ MessageEmbed } = require('discord.js'),
	{ PlaylistSchema } = require('../../database/models'),
	{ TrackUtils } = require('erela.js'),
	Command = require('../../structures/Command.js');

module.exports = class PLoad extends Command {
	constructor(bot) {
		super(bot, {
			name: 'p-load',
			dirname: __dirname,
			aliases: ['playlist-load'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Load a playlist',
			usage: 'p-load <playlist name>',
			cooldown: 3000,
			examples: ['p-load Songs'],
		});
	}

	async run(bot, message, settings) {
		// make sure a playlist name was entered
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

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
				return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
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
					return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
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
					const embed = new MessageEmbed()
						.setDescription(`Queued **${p.songs.length} songs** from **${message.args[0]}**.`);
					msg.edit('', embed);
				});
			} else {
				msg.edit('No playlist found');
			}
		});
	}
};
