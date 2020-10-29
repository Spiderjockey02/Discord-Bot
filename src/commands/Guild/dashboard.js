module.exports.run = async (bot, message) => {
	// Check if dashboard is enabled (config.js)
	if (bot.config.Dashboard.enabled == true) {
		message.channel.send(`${bot.config.Dashboard.domain}/manage/${message.guild.id}`);
	}
};

module.exports.config = {
	command: 'dashboard',
	aliases: ['db'],
	permissions: ['SEND_MESSAGES'],
};

module.exports.help = {
	name: 'Dashboard',
	category: 'Guild',
	description: 'Sends a link to your Server\'s dashboard.',
	usage: '${PREFIX}dashboard',
};
