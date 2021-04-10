// Dependecies
const { PlaylistSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class PDelete extends Command {
	constructor(bot) {
		super(bot, {
			name: 'p-delete',
			dirname: __dirname,
			aliases: ['playlist-delete'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Delete a playlist',
			usage: 'p-delete <playlist name>',
			cooldown: 3000,
			examples: ['p-delete Songs'],
		});
	}

	async run(bot, message, args, settings) {
		// Make sure a playlist name was entered
		if (!args[0]) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// Find and then delete playlist if it exists
		PlaylistSchema.findOne({
			name: args[0],
			creator: message.author.id,
		}, async (err, p) => {
			if (err) bot.logger.error(err.message);
			if (!p) {
				message.channel.send(`Couldn't find a playlist by the name: ${args[0]}.`);
			} else {
				try {
					await PlaylistSchema.findOneAndRemove({ name: args[0],	creator: message.author.id });
					message.channel.send(`Successfully deleted ${args[0]}`);
				} catch (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
				}
			}
		});
	}
};
