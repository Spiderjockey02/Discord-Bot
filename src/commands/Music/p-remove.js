// Dependecies
const { PlaylistSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class PRemove extends Command {
	constructor(bot) {
		super(bot, {
			name: 'p-remove',
			dirname: __dirname,
			aliases: ['playlist-remove'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'remove a song from the playlist',
			usage: 'p-remove <playlist name> <position> [position]',
			cooldown: 3000,
			examples: ['p-remove Songs 3', 'p-remove Songs 3 5'],
		});
	}

	async run(bot, message, settings) {
		// make sure something was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/p-remove:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		PlaylistSchema.findOne({
			name: message.args[0],
			creator: message.author.id,
		}, async (err, p) => {
			// if an error occured
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}

			// playlist found
			if (p) {
				try {
					if (!isNaN(message.args[1]) && !isNaN(message.args[2])) {
						p.songs.splice(message.args[1] - 1, parseInt(message.args[2] - message.args[1] + 1));
					} else if (!isNaN(message.args[1])) {
						p.songs.splice(message.args[1] - 1, 1);
					} else {
						return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/p-remove:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
					}
					await p.save();
					message.channel.success('music/p-remove:SUCCESS');
				} catch (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
				}
			} else {
				message.channel.error('music/p-remove:NO_PLAYLIST');
			}
		});
	}
};
