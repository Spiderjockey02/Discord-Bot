module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));
	try {
		bot.backup.load(message.guild.id, message.Guild);
	} catch (e) {
		console.log(e);
	}
};

module.exports.config = {
	command: 'b-load',
	aliases: ['backup-load'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Backup load',
	category: 'Backup',
	description: 'load a backup of the server.',
	usage: '${PREFIX}b-load',
};
