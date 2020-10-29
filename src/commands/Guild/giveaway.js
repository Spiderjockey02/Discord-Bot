// Dependencies
const Discord = require('discord.js');
const ms = require('ms');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Make sure something was included
	if (!args[0] || !args[1]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('giveaway').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	const time = require('../../utils/Time-Handler.js').getTotalTime(args[0], message, emojis);
	if (!time) return;
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

	// Time countdown calculator
	let i = 3;
	const x = await setInterval(async function() {
		const embed2 = new Discord.MessageEmbed()
			.setTitle('New giveaway!')
			.setDescription(`React with 🎉 to enter.\nTime remaining: ${ms(time / 4 * i, { long: true })}\nPrize is: **${prize}**.\nHosted by: ${message.author}.`)
			.setFooter('Ends at')
			.setTimestamp(endTime)
			.setColor('BLUE');
		await m.edit(embed2);
		i--;
		if (i == -1) {
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
			// giveaway ended
			clearInterval(x);
		}
	}, time / 4);
};

module.exports.config = {
	command: 'giveaway',
	aliases: ['give-away', 'give-a-way'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
};

module.exports.help = {
	name: 'Giveaway',
	category: 'Guild',
	description: 'Run a giveaway.',
	usage: '${PREFIX}giveway <time> <prize> [channel]',
	example: '${PREFIX}giveaway 10h5m nitro #giveaways',
};
