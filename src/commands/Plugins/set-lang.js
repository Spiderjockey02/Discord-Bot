// Dependecies
const Command = require('../../structures/Command.js');

// Languages supported
const languages = {
	'english': 'en-US',
	'arabic': 'ar-EG',
	'portuguese': 'pt-BR',
	'Persian': 'fa-IR',
};

module.exports = class Setlang extends Command {
	constructor(bot) {
		super(bot, {
			name: 'setlang',
			dirname: __dirname,
			aliases: ['setlanguage'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Choose the language for the bot.',
			usage: 'setlang <language>',
			cooldown: 5000,
			examples: ['setlang english'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Make sure user can edit server plugins
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// Make sure a language was entered
		if (!message.args[0]) return message.channel.error(settings.Language, 'PLUGINS/MISSING_LANGUAGE').then(m => m.delete({ timeout:10000 }));

		// Check what language
		if (languages[message.args[0].toLowerCase()]) {
			try {
				// update database
				await message.guild.updateGuild({ Language: languages[message.args[0].toLowerCase()] });
				settings.Language = languages[message.args[0].toLowerCase()];
				message.channel.success(settings.Language, 'PLUGINS/LANGUAGE_SET', message.args[0]).then(m => m.delete({ timeout:10000 }));
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
		} else {
			message.channel.error(settings.Language, 'PLUGINS/NO_LANGUAGE').then(m => m.delete({ timeout:10000 }));
		}
	}
};
