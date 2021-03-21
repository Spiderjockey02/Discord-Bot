// Dependecies
const	{ MessageEmbed } = require('discord.js'),
	{ Playlist } = require('../../modules/database/models'),
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
		});
	}

	async run(bot, message, args, settings) {

		const msg = await message.channel.send('Loading playlist (This might take a few seconds)...');

		if (!args[0]) return message.channel.send('Please enter a playlist name');

		Playlist.findOne({
			name: args[0],
			creator: message.author.id,
		}, async (err, p) => {
			if (err) bot.logger.log(err.message);
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
				} catch (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					return message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
				}

				player.queue.add(p.songs);
				if (!player.playing && !player.paused && !player.queue.length) player.play();
				const embed = new MessageEmbed()
					.setDescription(`Queued **${p.songs.length} songs** from **${p.name}**.`);
				msg.edit('', embed);
			} else {
				message.channel.send('No playlist found');
			}
		});
	}
};
