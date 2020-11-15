module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

	// update moderation plugin
	if (args[0] == 'true') {
		bot.updateGuild(message.guild, { ModerationPlugin: true });
		message.success(settings.Language, 'PLUGINS/MODERATION_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else if (args[0] == 'false') {
		bot.updateGuild(message.guild, { ModerationPlugin: false });
		message.success(settings.Language, 'PLUGINS/MODERATION_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else {
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('set-moderation').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'set-moderation',
	aliases: ['setmod', 'setmoderation'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'set-moderation',
	category: 'Plugins',
	description: 'Turn on or off the level plugin.',
	usage: '${PREFIX}set-moderation <true | false>',
};
