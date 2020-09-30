// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	// Get information on the services the bot provide
	const m = await message.channel.send('Pong');
	const embed = new Discord.MessageEmbed()
		.addField('Ping:', `\`${m.createdTimestamp - message.createdTimestamp}ms\``, true)
		.addField('Client API:', `\`${Math.round(bot.ws.ping)}ms\``, true)
		.addField('MongoDB:', `\`${bot.mongoose.ping()}ms\``, true)
		.setTimestamp();
	message.channel.send(embed);
};

module.exports.config = {
	command: 'status',
	aliases: ['stat'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Status',
	category: 'Misc',
	description: 'Gets the status for me',
	usage: '!status',
};
