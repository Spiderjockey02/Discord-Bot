module.exports.run = async (bot, message) => {
	// Make sure only bot owner can do this command
	if (message.author.id !== bot.config.ownerID) return;
};

module.exports.config = {
	command: 'addban',
	aliases: ['addban'],
};

module.exports.help = {
	name: 'Addban',
	category: 'Host',
	description: 'Add a ban to the global ban list.',
	usage: '${PREFIX}addban <user> <reason>',
};
