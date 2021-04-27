// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ timeEventSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class Ban extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ban',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: ['BAN_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
			description: 'Ban a user.',
			usage: 'ban <user> [reason] [time]',
			cooldown: 5000,
			examples: ['ban username spamming chat 4d', 'ban username raiding'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Make sure user can ban users
		if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'BAN_MEMBERS').then(m => m.delete({ timeout: 10000 }));


		// Check if bot has permission to ban user
		if (!message.guild.me.hasPermission('BAN_MEMBERS')) {
			bot.logger.error(`Missing permission: \`BAN_MEMBERS\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'BAN_MEMBERS').then(m => m.delete({ timeout: 10000 }));
		}

		// Get user and reason
		const reason = (message.args.join(' ').slice(22)) ? message.args.join(' ').slice(22) : bot.translate(settings.Language, 'NO_REASON');

		// Make sure user is real
		const member = message.getMember();

		// Make sure user isn't trying to punish themselves
		if (member[0].user.id == message.author.id) return message.channel.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

		// Make sure user user does not have ADMINISTRATOR permissions
		if (member[0].hasPermission('ADMINISTRATOR')) return message.channel.error(settings.Language, 'MODERATION/TOO_POWERFUL').then(m => m.delete({ timeout: 10000 }));

		// Ban user with reason and check if timed ban
		try {
			// send DM to user
			try {
				const embed = new MessageEmbed()
					.setTitle('BANNED')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(`You have been banned from ${message.guild.name}.`)
					.addField('Banned by:', message.author.tag, true)
					.addField('Reason:', reason, true);
				await member[0].send(embed);
				// eslint-disable-next-line no-empty
			} catch (e) {}

			// Ban user from guild
			await member[0].ban({ reason: reason });
			message.channel.success(settings.Language, 'MODERATION/SUCCESSFULL_BAN', member[0].user).then(m => m.delete({ timeout: 8000 }));

			// Check to see if this ban is a tempban
			const possibleTime = message.args[message.args.length - 1];
			if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
				const time = bot.timeFormatter.getTotalTime(possibleTime, message, settings.Language);
				if (!time) return;

				// connect to database
				const newEvent = await new timeEventSchema({
					userID: member[0].user.id,
					guildID: message.guild.id,
					time: new Date(new Date().getTime() + time),
					channelID: message.channel.id,
					type: 'ban',
				});
				await newEvent.save();

				// unban user
				setTimeout(async () => {
					message.args[0] = member[0].user.id;
					await bot.commands.get('unban').run(bot, message, settings);

					// Delete item from database as bot didn't crash
					await timeEventSchema.findByIdAndRemove(newEvent._id, (err) => {
						if (err) console.log(err);
					});
				}, time);
			}
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
