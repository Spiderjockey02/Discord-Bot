module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`MANAGE_GUILD\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}

	// update moderation plugin
	if (args[0] == 'on') {
		bot.updateGuild(message.guild, { ModerationPlugin: true });
		message.success(settings.Language, 'PLUGINS/MODERATION_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else if (args[0] == 'off') {
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
