module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

	// update music plugin
	if (args[0] == 'true') {
		bot.updateGuild(message.guild, { MusicPlugin: true });
		message.success(settings.Language, 'PLUGINS/MUSIC_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else if (args[0] == 'false') {
		bot.updateGuild(message.guild, { MusicPlugin: false });
		message.success(settings.Language, 'PLUGINS/MUSIC_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else {
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('set-music').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'set-music',
	aliases: ['setmusic'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'set-music',
	category: 'Plugins',
	description: 'Turn on or off the music plugin.',
	usage: '${PREFIX}set-music <true | false>',
};
