// Dependecies
const ms = require('../../utils/timeFormatter'),
	{ MessageEmbed } = require('discord.js'),
	{ Playlist } = require('../../modules/database/models'),
	Command = require('../../structures/Command.js'),
	MS = new ms;

module.exports = class PView extends Command {
	constructor(bot) {
		super(bot, {
			name: 'p-view',
			dirname: __dirname,
			aliases: ['playlist-view'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'View a playlist',
			usage: 'p-view <playlist name>',
			cooldown: 3000,
		});
	}

	async run(bot, message, args) {
		Playlist.findOne({
			name: args[0],
			creator: message.author.id,
		}, async (err, p) => {
			if (err) bot.logger.error(err.message);
			if (!p) {
				const embed = new MessageEmbed()
					.setAuthor(p.name, message.author.displayAvatarURL())
					.setDescription(`Couldn't find a playlist by the name ${p.name}.`)
					.setTimestamp();
				return message.channel.send(embed);
			} else {
				const embed = new MessageEmbed()
					.setAuthor(message.author.tag, message.author.displayAvatarURL())
					.setThumbnail(p.thumbnail)
					.setTitle(p.name)
					.setDescription([`Song count: ${p.songs.length}`].join('\n'));
				message.channel.send(embed);
			}
		});
	}
};
