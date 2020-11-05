module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`MANAGE_GUILD\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}

	// update level plugin
	if (args[0] == 'on') {
		bot.updateGuild(message.guild, { LevelPlugin: true });
	} else if (args[0] == 'off') {
		bot.updateGuild(message.guild, { LevelPlugin: false });
	} else {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('p-level').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'p-level',
	aliases: ['level'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'p-level',
	category: 'Plugins',
	description: 'Turn on or off the level plugin.',
	usage: '${PREFIX}p-level <on | off>',
};
