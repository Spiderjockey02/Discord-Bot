// Dependencies
const { Embed } = require('../../utils'),
	{ timeEventSchema } = require('../../database/models'),
	{ time: { getTotalTime } } = require('../../utils'),
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

		// Get user and reason
		const reason = message.args[1] ? message.args.splice(1, message.args.length).join(' ') : message.translate('misc:NO_REASON');

		// Make sure user is real
		const members = await message.getMember();

		// Make sure user isn't trying to punish themselves
		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH').then(m => m.delete({ timeout: 10000 }));

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (members[0].hasPermission('ADMINISTRATOR') || members[0].roles.highest.comparePositionTo(message.guild.me.roles.highest) >= 0) {
			return message.channel.error('moderation/ban:TOO_POWERFUL').then(m => m.delete({ timeout: 10000 }));
		}

		// Ban user with reason and check if timed ban
		try {
			// send DM to user
			try {
				const embed = new Embed(bot, message.guild)
					.setTitle('moderation/ban:TITLE')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(message.translate('moderation/ban:DESC', { NAME: message.guild.name }))
					.addField(message.translate('moderation/ban:BAN_BY'), message.author.tag, true)
					.addField(message.translate('misc:REASON'), reason, true);
				await members[0].send(embed);
				// eslint-disable-next-line no-empty
			} catch (e) {}

			// Ban user from guild
			await members[0].ban({ reason: reason });
			message.channel.success('moderation/ban:SUCCESS', { USER: members[0].user }).then(m => m.delete({ timeout: 8000 }));

			// Check to see if this ban is a tempban
			const possibleTime = message.args[message.args.length - 1];
			if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
				const time = getTotalTime(possibleTime, message);
				if (!time) return;

				// connect to database
				const newEvent = await new timeEventSchema({
					userID: members[0].user.id,
					guildID: message.guild.id,
					time: new Date(new Date().getTime() + time),
					channelID: message.channel.id,
					type: 'ban',
				});
				await newEvent.save();

				// unban user
				setTimeout(async () => {
					message.args[0] = members[0].user.id;
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
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
