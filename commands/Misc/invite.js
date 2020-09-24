module.exports.run = async (bot, message) => {
	// Make sure bot can see invites
	message.channel.send({ embed:{ description:'[Invite me to your server](https://discord.com/api/oauth2/authorize?client_id=647203942903840779&permissions=8&scope=bot)' } });
};

module.exports.config = {
	command: 'invite',
	aliases: ['inv'],
};

module.exports.help = {
	name: 'Invite',
	category: 'Misc',
	description: 'Send an invite link so peope can add me to their server',
	usage: '!invite',
};
