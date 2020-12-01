module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

	// update search plugin
	if (args[0] == 'true') {
		bot.updateGuild(message.guild, { SearchPlugin: true });
		message.success(settings.Language, 'PLUGINS/SEARCH_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else if (args[0] == 'false') {
		bot.updateGuild(message.guild, { SearchPlugin: false });
		message.success(settings.Language, 'PLUGINS/SEARCH_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else {
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('set-search').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'set-search',
	aliases: ['setsearch'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'set-search',
	category: 'Plugins',
	description: 'Turn on or off the search plugin.',
	usage: '${PREFIX}set-search <true | false>',
};
