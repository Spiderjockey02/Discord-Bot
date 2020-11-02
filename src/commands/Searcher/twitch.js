const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args) => {
	// Get information on twitch accounts
	if (message.author.id != bot.config.ownerID) return;
	if (!args[0]) return message.channel.send('Please enter a Twitch username');
	const embed = new MessageEmbed()
		.setColor(10181046)
		.setTitle(`${args[0]}`)
		.setURL(`https://www.twitch.tv/${args[0]}`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'twitch',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Twitch',
	category: 'Searcher',
	description: 'Get information on a twitch account.',
	usage: '${PREFIX}twitch <user>',
};
