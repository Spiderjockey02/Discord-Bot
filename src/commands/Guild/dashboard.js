module.exports.run = async (bot, message) => {
	message.channel.send(`${bot.config.websiteURL}/dashboard/${message.guild.id}`);
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
