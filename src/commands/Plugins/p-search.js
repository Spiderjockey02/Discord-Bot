module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`MANAGE_GUILD\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}

	// update search plugin
	if (args[0] == 'on') {
		bot.updateGuild(message.guild, { SearchPlugin: true });
	} else if (args[0] == 'off') {
		bot.updateGuild(message.guild, { SearchPlugin: false });
	} else {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('p-search').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'p-search',
	aliases: ['search'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'p-search',
	category: 'Plugins',
	description: 'Turn on or off the search plugin.',
	usage: '${PREFIX}p-search <on | off>',
};
