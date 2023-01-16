// Dependencies
const ms = require('ms'),
	{ AttachmentBuilder, ApplicationCommandOptionType } = require('discord.js'),
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
			description: 'Set a reminder.',
			usage: 'reminder <time> <information>',
			cooldown: 1000,
			examples: ['reminder 1h feed cat', 'reminder 1d ban trolls'],
			slash: true,
			options: [
				{
					name: 'time',
					description: 'How long till I remind you.',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
				{
					name: 'text',
					description: 'What should I remind you off.',
					type: ApplicationCommandOptionType.String,
					maxLength: 2000,
					required: true,
				},
			],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(bot, message, settings) {
		// Make something that time and information is entered
		if (!message.args[1]) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/reminder:USAGE')) });
		}

		// Get time
		const { error, success: time } = getTotalTime(message.args[0]);
		if (error) return message.channel.error(error);
		message.args.shift();

		// send reminder
		await message.channel.send(message.translate('fun/reminder:MESSAGE', { INFO: message.args.join(' '), TIME: ms(time, { long: true }) })).then(async () => {
			// save to DB
			const newEvent = new timeEventSchema({
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
				const attachment = new AttachmentBuilder('./src/assets/imgs/Timer.png', { name: 'Timer.png' });
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

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			member = guild.members.cache.get(interaction.user.id),
			text = args.get('text').value;

		// Get time
		const { error, success: time } = getTotalTime(args.get('time').value);
		if (error) return interaction.reply({ embeds: [channel.error(error, null, true)], ephemeral: true });

		// send reminder
		try {
			const msg = await interaction.reply({
				content: guild.translate('fun/reminder:MESSAGE', { INFO: text, TIME: ms(time, { long: true }) }),
				fetchReply: true,
			});
			// save to DB
			const newEvent = new timeEventSchema({
				userID: interaction.user.id,
				guildID: guild.id,
				channelID: channel.id,
				time: new Date(new Date().getTime() + time),
				message: text,
				type: 'reminder',
			});
			await newEvent.save();

			// Once time is up send reply
			setTimeout(async () => {
				// send embed to author's DM
				const attachment = new AttachmentBuilder('./src/assets/imgs/Timer.png', { name: 'Timer.png' });
				const embed = new Embed(bot, guild)
					.setTitle('fun/reminder:TITLE')
					.setThumbnail('attachment://Timer.png')
					.setDescription(`${text}\n[${guild.translate('fun/reminder:MSG_LINK')}](https://discord.com/channels/${guild.id}/${interaction.channelId}/${msg.id})`)
					.setFooter({ text: guild.translate('fun/reminder:FOOTER', { TIME: ms(time, { long: true }) }) });

				member.send({ embeds: [embed], files: [attachment] }).catch(() => {
					channel.send(guild.translate('fun/reminder:RESPONSE', { INFO: text }).replace('{USER}', member));
				});

				// Delete from database as bot didn't crash
				await timeEventSchema.findByIdAndRemove(newEvent._id, (err) => {
					if (err) console.log(err);
				});
			}, time);
		} catch (err) {
			console.log(err);
		}
	}
}

module.exports = Reminder;
