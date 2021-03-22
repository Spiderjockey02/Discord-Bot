// Dependencies
const ms = require('ms'),
	{ MessageEmbed, MessageAttachment } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Reminder extends Command {
	constructor(bot) {
		super(bot, {
			name: 'reminder',
			dirname: __dirname,
			aliases: ['remindme'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Set a reminder.',
			usage: 'reminder <time> <information>',
			cooldown: 1000,
			examples: ['reminder 1h feed cat', 'reminder 1d ban trolls'],
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Make something that time and information is entered
		if (!args[1]) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}

		// Get time
		const time = require('../../helpers/time-converter.js').getTotalTime(args[0], message, settings.Language);
		if (!time) return;
		args.shift();

		// send reminder
		await message.sendT(settings.Language, 'FUN/REMINDER_MESSAGE', [`${args.join(' ')}`, `${ms(time, { long: true })}`]).then(() => {
			// Once time is up send reply
			setTimeout(() => {
				// send embed to author's DM
				const attachment = new MessageAttachment('./src/assets/imgs/Timer.png', 'Timer.png');
				const embed = new MessageEmbed()
					.setTitle(message.translate(settings.Language, 'FUN/REMINDER_TITLE'))
					.setColor('RANDOM')
					.attachFiles(attachment)
					.setThumbnail('attachment://Timer.png')
					.setDescription(`${args.join(' ')}\n[${message.translate(settings.Language, 'FUN/REMINDER_DESCRIPTION')}](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`)
					.setFooter(message.translate(settings.Language, 'FUN/REMINDER_FOOTER', ms(time, { long: true })));
				message.author.send(embed).catch(() => {
					message.sendT(settings.Language, 'FUN/REMINDER_RESPONSE', [`\n**REMINDER:**\n ${message.author}`, `${args.join(' ')}`]);
				});
			}, time);
		});
	}
};
