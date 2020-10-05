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

module.exports.run = async (bot, message, args, settings) => {
	// Get the right emoji (just in case bot dosen't have external emoji permission)
	const emoji = (message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.cross : ':negative_squared_cross_mark:';
	// Make sure something was included
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('giveaway').help.usage.replace('${prefix}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Make sure that a time interval is included
	if (!args[0].endsWith('d') && !args[0].endsWith('h') && !args[0].endsWith('m')) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Example of how to do a \`giveaway\`: \`${bot.commands.get('giveaway').help.example.replace('${prefix}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Make sure that the time is a number
	if (isNaN(args[0][0])) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('giveaway').help.usage.replace('${prefix}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
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

	const time = Date.now() + ms(args[0]);
	const embed = new Discord.MessageEmbed()
		.setTitle('New giveaway!')
		.setDescription(`React with 🎉 to enter.\nTime remaining: ${ms(ms(args[0]), { long: true })}\nPrize is: **${prize}**.\nHosted by: ${message.author}.`)
		.setFooter('Ends at')
		.setTimestamp(time)
		.setColor('BLUE');
	const m = await channel.send(embed);
	await m.react('🎉');
	// Update
	let i = 3;
	while (i != -1) {
		const embed2 = new Discord.MessageEmbed()
			.setTitle('New giveaway!')
			.setDescription(`React with 🎉 to enter.\nTime remaining: ${ms(ms(args[0]) / 4 * i, { long: true })}\nPrize is: **${prize}**.\nHosted by: ${message.author}.`)
			.setFooter('Ends at')
			.setTimestamp(time)
			.setColor('BLUE');
		sleep(ms(args[0]) / 4);
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
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Giveaway',
	category: 'Guild',
	description: 'Run a giveaway',
	usage: '${prefix}giveway <time> <prize> [channel]',
	example: '${prefix}giveaway 1h30m nitro',
};
