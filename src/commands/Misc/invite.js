module.exports.run = async (bot, message, args, settings) => {
	// Make sure bot can see invites
	message.channel.send({ embed:{ description:`[${message.translate(settings.Language, 'MISC/INVITE_TEXT')}](https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=485846102&scope=bot)` } });
};

module.exports.config = {
	command: 'invite',
	aliases: ['inv'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Invite',
	category: 'Misc',
	description: 'Send an invite link so people can add me to their server.',
	usage: '${PREFIX}invite',
};
