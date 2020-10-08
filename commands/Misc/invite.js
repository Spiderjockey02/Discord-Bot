module.exports.run = async (bot, message) => {
	// Make sure bot can see invites
	message.channel.send({ embed:{ description:`[Invite me to your server](https://discord.com/api/oauth2/authorize?client_id=${bot.config.botID}&permissions=485846102&scope=bot)` } });
};

module.exports.config = {
	command: 'invite',
	aliases: ['inv'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Invite',
	category: 'Misc',
	description: 'Send an invite link so peope can add me to their server',
	usage: '${PREFIX}invite',
};
