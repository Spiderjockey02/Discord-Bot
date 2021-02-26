// Dependecies
const Command = require('../../structures/Command.js');

module.exports = class SetSearch extends Command {
	constructor(bot) {
		super(bot, {
			name: 'set-search',
			dirname: __dirname,
			aliases: ['setsearch'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Turn on or off the search plugin.',
			usage: 'set-search <true | false>',
			cooldown: 5000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Make sure user can edit server plugins
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// update search plugin
		try {
			if (args[0] == 'true') {
				await message.guild.updateGuild({ SearchPlugin: true });
				message.success(settings.Language, 'PLUGINS/SEARCH_SET', args[0]).then(m => m.delete({ timeout:10000 }));
			} else if (args[0] == 'false') {
				await message.guild.updateGuild({ SearchPlugin: false });
				message.success(settings.Language, 'PLUGINS/SEARCH_SET', args[0]).then(m => m.delete({ timeout:10000 }));
			} else {
				return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
			}
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
