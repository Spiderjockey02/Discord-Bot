// Dependencies
const ms = require('ms');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports.run = async (bot, message, args, emojis, settings) => {
	if (!args[0] || !args[1]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('reminder').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Get time
	const time = require('../../utils/Time-Handler.js').getTotalTime(args[0], message, emojis);
	if (!time) return;
	args.shift();
	// send reminder
	await message.channel.send(`I'll remind you about \`${args.join(' ')}\` in about ${ms(time, { long: true })}.`).then(() => {
		// Once time is up send reply
		setTimeout(() => {
			// make embed
			try {
				// send embed to author's DM
				const attachment = new MessageAttachment('./src/assets/imgs/Timer.png', 'Timer.png');
				const embed = new MessageEmbed()
					.setTitle('Reminder')
					.setColor('RANDOM')
					.attachFiles(attachment)
					.setThumbnail('attachment://Timer.png')
					.setDescription(`${args.join(' ')}\n[Message link](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`)
					.setFooter(`Reminder from ${ms(time, { long: true })} ago.`);
				message.author.send(embed);
			} catch (e) {
				message.channel.send(`\n**REMINDER:**\n ${message.author} your reminder: ${args.join(' ')}`);
			}
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
