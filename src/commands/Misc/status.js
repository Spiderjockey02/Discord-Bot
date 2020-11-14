// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Get information on the services the bot provide
	const m = await message.channel.send('Pong');
	const embed = new MessageEmbed()
		.addField(message.translate(settings.Language, 'MISC/STATUS_PING'), `\`${m.createdTimestamp - message.createdTimestamp}ms\``, true)
		.addField(message.translate(settings.Language, 'MISC/STATUS_CLIENT'), `\`${Math.round(bot.ws.ping)}ms\``, true)
		.addField(message.translate(settings.Language, 'MISC/STATUS_MONGO'), `\`${Math.round(await bot.mongoose.ping())}ms\``, true)
		.setTimestamp();
	await message.channel.send(embed);
	m.delete();
};

module.exports.config = {
	command: 'status',
	aliases: ['stat', 'ping'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Status',
	category: 'Misc',
	description: 'Gets the status of the bot.',
	usage: '${PREFIX}status',
};
