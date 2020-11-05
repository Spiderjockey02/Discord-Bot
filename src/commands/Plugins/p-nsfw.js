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
	} else if (args[0] == 'off') {
		bot.updateGuild(message.guild, { NSFWPlugin: false });
	} else {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('p-nsfw').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'p-nsfw',
	aliases: ['nsfw'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'p-nsfw',
	category: 'Plugins',
	description: 'Turn on or off the NSFW plugin.',
	usage: '${PREFIX}p-nsfw <on | off>',
};
