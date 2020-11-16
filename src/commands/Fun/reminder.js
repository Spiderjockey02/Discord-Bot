// Dependencies
const ms = require('ms');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Make something that time and information is entered
	if (!args[0] || !args[1]) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('reminder').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	// Get time
	const time = require('../../helpers/time-converter.js').getTotalTime(args[0], message, settings.Language);
	if (!time) return;
	args.shift();

	// send reminder
	await message.sendT(settings.Language, 'FUN/REMINDER_MESSAGE', [`${args.join(' ')}`, `${ms(time, { long: true })}`]).then(() => {
		// Once time is up send reply
		setTimeout(() => {
			// make embed
			try {
				// send embed to author's DM
				const attachment = new MessageAttachment('./src/assets/imgs/Timer.png', 'Timer.png');
				const embed = new MessageEmbed()
					.setTitle(message.translate(settings.Language, 'FUN/REMINDER_TITLE'))
					.setColor('RANDOM')
					.attachFiles(attachment)
					.setThumbnail('attachment://Timer.png')
					.setDescription(`${args.join(' ')}\n[${message.translate(settings.Language, 'FUN/REMINDER_DESCRIPTION')}](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`)
					.setFooter(message.translate(settings.Language, 'FUN/REMINDER_FOOTER', ms(time, { long: true })));
				message.author.send(embed);
			} catch (e) {
				message.sendT(settings.Language, 'FUN/REMINDER_RESPONSE', [`\n**REMINDER:**\n ${message.author}`, `${args.join(' ')}`]);
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
