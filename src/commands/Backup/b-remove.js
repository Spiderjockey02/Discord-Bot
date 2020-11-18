module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));
	try {
		bot.backup.remove(message.guild);
	} catch (e) {
		console.log(e);
	}
};

module.exports.config = {
	command: 'b-remove',
	aliases: ['backup-remove'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Backup remove',
	category: 'Backup',
	description: 'remove a backup of the server.',
	usage: '${PREFIX}b-remove',
};
