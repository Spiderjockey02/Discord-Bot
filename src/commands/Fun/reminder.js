// Dependencies
const ms = require('ms');

module.exports.run = async (bot, message, args, emojis, settings) => {
	if (!args[0] || !args[1]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('reminder').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Get time
	const time = require('../../utils/Time-Handler.js').getTotalTime(args[0], message, emojis);
	if (!time) return;
	// send reminder
	await message.channel.send(`Your reminder has been set. I will remind you in ${ms(time, { long: true })}.`).then(() => {
		// Once time is up send reply
		setTimeout(() => {
			args.shift();
			message.channel.send(`\n**REMINDER:**\n ${args.join(' ')}`);
		}, time);
	});

};

module.exports.config = {
	command: 'reminder',
	aliases: ['remindme'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Reminder',
	category: 'Fun',
	description: 'Set a reminder.',
	usage: '${PREFIX}reminder <time> <information>',
	example: '${PREFIX}reminder 1h let dog out',
};
