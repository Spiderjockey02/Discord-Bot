// Dependencies
const Discord = require('discord.js');
const ms = require('ms');

async function sleep(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}
module.exports.run = async (bot, message, args, emojis, settings) => {
	try {
		if (!args[0] || !args[1]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('reminder').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
		// Make sure that a time interval is included
		if (!args[0].endsWith('d') && !args[0].endsWith('h') && !args[0].endsWith('m')) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Example of how to do a \`reminder\`: \`${bot.commands.get('reminder').help.example.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
		// Make sure that the time is a number
		if (isNaN(args[0][0])) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('reminder').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
		// Check if multiply times were used
		if (args[0].length - args[0].replace(/[A-Za-z]/g, '').length != 1) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} For now only \`1\` time interval can be used.` } }).then(m => m.delete({ timeout: 5000 }));
		// Get time
		const time = ms(args[0]);
		await message.channel.send('Reminder has been set').then();
		sleep(time);
		message.channel.send('reminder up. here it is');
	} catch (e) {
		console.log(e);
	}
};

module.exports.config = {
	command: 'reminder',
	aliases: ['remindme'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Reminder',
	category: 'Fun',
	description: 'Get some random advice.',
	usage: '${PREFIX}reminder <time> <information>',
	example: '${PREFIX}reminder 1h let dog out',
};
