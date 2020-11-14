module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

	// update level plugin
	if (args[0] == 'true') {
		bot.updateGuild(message.guild, { LevelPlugin: true });
		message.success(settings.Language, 'PLUGINS/LEVEL_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else if (args[0] == 'false') {
		bot.updateGuild(message.guild, { LevelPlugin: false });
		message.success(settings.Language, 'PLUGINS/LEVEL_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else {
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('set-level').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'set-level',
	aliases: ['setlevel'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'set-level',
	category: 'Plugins',
	description: 'Turn on or off the level plugin.',
	usage: '${PREFIX}set-level <true | false>',
};
