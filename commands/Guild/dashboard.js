module.exports.run = async (bot, message) => {
	// Check if dashboard is enabled (config.js)
	if (message.author.id != bot.config.ownerID) return message.channel.send('The dashboard is currently down for maintance');
	if (bot.config.Dashboard.enabled == true) {
		message.channel.send(`${bot.config.Dashboard.domain}/manage/${message.guild.id}`);
	}
};

module.exports.config = {
	command: 'dashboard',
	aliases: ['db'],
};

module.exports.help = {
	name: 'Dashboard',
	category: 'Guild',
	description: 'Displays a link to your Server\'s dashboard.',
	usage: '!dashboard',
};
