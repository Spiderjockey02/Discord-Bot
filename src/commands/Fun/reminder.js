// Dependencies
const ms = require('ms'),
	{ MessageAttachment } = require('discord.js'),
	{ timeEventSchema } = require('../../database/models'),
	{ time: { getTotalTime }, Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Reminder command
 * @extends {Command}
*/
class Reminder extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
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

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(bot, message, settings) {
		// Make something that time and information is entered
		if (!message.args[1]) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/reminder:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// Get time
		const time = getTotalTime(message.args[0], message, settings.Language);
		if (!time) return;
		message.args.shift();

		// send reminder
		await message.channel.send(message.translate('fun/reminder:MESSAGE', { INFO: message.args.join(' '), TIME: ms(time, { long: true }) })).then(async () => {
			// save to DB
			const newEvent = await new timeEventSchema({
				userID: message.author.id,
				guildID: message.guild?.id,
				channelID: message.channel.id,
				time: new Date(new Date().getTime() + time),
				message: message.args.join(' '),
				type: 'reminder',
			});
			await newEvent.save();

			// Once time is up send reply
			setTimeout(async () => {
				// send embed to author's DM
				const attachment = new MessageAttachment('./src/assets/imgs/Timer.png', 'Timer.png');
				const embed = new Embed(bot, message.guild)
					.setTitle('fun/reminder:TITLE')
					.setThumbnail('attachment://Timer.png')
					.setDescription(`${message.args.join(' ')}\n[${message.translate('fun/reminder:MSG_LINK')}](https://discord.com/channels/${message.guild?.id ?? '@me'}/${message.channel.id}/${message.id})`)
					.setFooter({ text: message.translate('fun/reminder:FOOTER', { TIME: ms(time, { long: true }) }) });

				message.member.send({ embeds: [embed], files: [attachment] }).catch(() => {
					message.channel.send(message.translate('fun/reminder:RESPONSE', { INFO: message.args.join(' ') }).replace('{USER}', message.member));
				});

				// Delete from database as bot didn't crash
				await timeEventSchema.findByIdAndRemove(newEvent._id, (err) => {
					if (err) console.log(err);
				});
			}, time);
		});
	}
}

module.exports = Reminder;
