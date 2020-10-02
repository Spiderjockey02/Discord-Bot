// Dependencies
const Discord = require('discord.js');
const ms = require('ms');

module.exports.run = async (bot, message, args) => {
	if (!args[0]) return message.channel.send('You did not specify your time!');
	if (!args[0].endsWith('d') && !args[0].endsWith('h') && !args[0].endsWith('m')) {
		return message.channel.send(`${bot.config.emojis.cross}You did not use the correct formatting for the time!`);
	}

	if (isNaN(args[0][0])) return message.channel.send('That is not a number!');

	const channel = message.mentions.channels.first();
	if (!channel) {
		return message.channel.send(`${bot.config.emojis.cross}I could not find that channel in the guild!`);
	}
	const prize = args.slice(2).join(' ');
	if (!prize) return message.channel.send('No prize specified!');
	message.channel.send(`*Giveaway created in ${channel}*`);
	const embed = new Discord.MessageEmbed()
		.setTitle('New giveaway!')
		.setDescription(`<a:Party:743831237684363324>The user ${message.author} is hosting a giveaway for the prize of **${prize}**`)
		.setTimestamp(Date.now() + ms(args[0]))
		.setColor('BLUE');
	const m = await channel.send(embed);
	m.react('🎉');
	setTimeout(() => {
		if (m.reactions.cache.get('🎉').count <= 1) {
			message.channel.send(`Reactions: ${m.reactions.cache.get('🎉').count}`);
			return message.channel.send('<a:Party:743831237684363324>Not enough people reacted for me to start draw a winner!');
		}

		const winner = m.reactions.cache.get('🎉').users.cache.filter((u) => !u.bot).random();
		channel.send(`<a:Party:743831237684363324>The winner of the giveaway for **${prize}** is... ${winner}`);
	}, ms(args[0]));
};

module.exports.config = {
	command: 'giveaway',
	aliases: ['give-away', 'give-a-way'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Giveaway',
	category: 'Guild',
	description: 'Run a giveaway',
	usage: '!givewaay [time] [channel] [prize]',
};
