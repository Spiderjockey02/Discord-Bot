module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`MANAGE_GUILD\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}

	// update NSFw plugin
	if (args[0] == 'on') {
		bot.updateGuild(message.guild, { NSFWPlugin: true });
		message.success(settings.Language, 'PLUGINS/NSFW_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else if (args[0] == 'off') {
		bot.updateGuild(message.guild, { NSFWPlugin: false });
		message.success(settings.Language, 'PLUGINS/NSFW_SET', args[0]).then(m => m.delete({ timeout:10000 }));
	} else {
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('set-nsfw').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'set-nsfw',
	aliases: ['nsfw'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'set-nsfw',
	category: 'Plugins',
	description: 'Turn on or off the NSFW plugin.',
	usage: '${PREFIX}set-nsfw <true | false>',
};
