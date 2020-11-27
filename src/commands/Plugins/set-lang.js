// Languages supported
const languages = {
	'english': 'en-US',
	'arabic': 'ar-EG',
};

module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'BAN_MEMBERS').then(m => m.delete({ timeout: 10000 }));

	// Make sure a language was entered
	if (!args[0]) return message.error(settings.Language, 'PLUGINS/MISSING_LANGUAGE').then(m => m.delete({ timeout:10000 }));

	// Check what language
	if (languages[args[0].toLowerCase()]) {
		await bot.updateGuild(message.guild, { Language: languages[args[0].toLowerCase()] });
		message.success(settings.Language, 'PLUGINS/LANGUAGE_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else {
		message.error(settings.Language, 'PLUGINS/NO_LANGUAGE').then(m => m.delete({ timeout:10000 }));
	}
};

module.exports.config = {
	command: 'setlang',
	aliases: ['setlanguage'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'setlang',
	category: 'Plugins',
	description: 'Choose the language for the bot.',
	usage: '${PREFIX}setlang <language>',
};
