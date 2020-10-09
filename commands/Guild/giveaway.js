// Dependencies
const Discord = require('discord.js');
const ms = require('ms');

// TIme interval
function sleep(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Make sure something was included
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('giveaway').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Make sure that a time interval is included
	if (!args[0].endsWith('d') && !args[0].endsWith('h') && !args[0].endsWith('m')) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Example of how to do a \`giveaway\`: \`${bot.commands.get('giveaway').help.example.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Make sure that the time is a number
	if (isNaN(args[0][0])) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('giveaway').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Check if multiply times were used
	if (args[0].length - args[0].replace(/[A-Za-z]/g, '').length != 1) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} For now only \`1\` time interval can be used.` } }).then(m => m.delete({ timeout: 5000 }));
	// Get time
	const time = ms(args[0]);
	// get prize
	let channel = message.mentions.channels.first();
	let prize;
	// Get prize
	if (channel) {
		prize = args.slice(1);
		prize = prize.slice(0, -1).join(' ');
		message.channel.send(`*Giveaway created in ${channel}*`).then(m => m.delete({ timeout:10000 }));

	} else {
		prize = args.slice(1).join(' ');
		channel = message.channel;
	}
	// send giveaway embed
	bot.logger.log(`${message.author.username}#${message.author.discriminator} is hosting a giveaway in the server: [${message.guild.id}].`);

	const endTime = Date.now() + ms(args[0]);
	const embed = new Discord.MessageEmbed()
		.setTitle('New giveaway!')
		.setDescription(`React with 🎉 to enter.\nTime remaining: ${ms(time, { long: true })}\nPrize is: **${prize}**.\nHosted by: ${message.author}.`)
		.setFooter('Ends at')
		.setTimestamp(endTime)
		.setColor('BLUE');
	const m = await channel.send(embed);
	await m.react('🎉');
	// Update
	let i = 3;
	while (i != -1) {
		const embed2 = new Discord.MessageEmbed()
			.setTitle('New giveaway!')
			.setDescription(`React with 🎉 to enter.\nTime remaining: ${ms(time / 4 * i, { long: true })}\nPrize is: **${prize}**.\nHosted by: ${message.author}.`)
			.setFooter('Ends at')
			.setTimestamp(endTime)
			.setColor('BLUE');
		sleep(time / 4);
		await m.edit(embed2);
		i--;
	}
	// wait for giveaway to finish and then find winner
	if (m.reactions.cache.get('🎉').count <= 1) {
		message.channel.send(`Reactions: ${m.reactions.cache.get('🎉').count}`);
		return message.channel.send('🎉Not enough people reacted for me to start draw a winner!');
	}
	const winner = m.reactions.cache.get('🎉').users.cache.filter((u) => !u.bot).random();
	channel.send(`🎉The winner of the giveaway for **${prize}** is... ${winner}`);
	// update embed so people know its finished
	const embed3 = new Discord.MessageEmbed()
		.setTitle('Giveaway ended!')
		.setDescription(`Winner: ${winner}\nPrize was: **${prize}**\nHosted by: ${message.author}`)
		.setFooter('Ended at')
		.setTimestamp(Date.now())
		.setColor('BLUE');
	m.edit(embed3);
};

module.exports.config = {
	command: 'giveaway',
	aliases: ['give-away', 'give-a-way'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
};

module.exports.help = {
	name: 'Giveaway',
	category: 'Guild',
	description: 'Run a giveaway',
	usage: '${PREFIX}giveway <time> <prize> [channel]',
	example: '${PREFIX}giveaway 10h5m nitro #giveaways',
};
