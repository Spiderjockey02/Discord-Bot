// Dependencies
const { WarningSchema, timeEventSchema } = require('../database/models'),
	{ time: { getTotalTime }, Embed } = require('../utils');

module.exports.run = async (bot, userInput, member, reason) => {
	const { guild } = userInput;

	// retrieve user data in warning database
	try {
		const warnings = WarningSchema.find({
			userID: member.user.id,
			guildID: userInput.guild.id,
		});

		// This is their first warning
		let newWarn;
		if (!warnings[0]) {
			// debugging mode
			if (bot.config.debug) bot.logger.debug(`${member.user.displayName} was warned for the first time in guild: ${userInput.guild.id}`);

			try {
				// create a new warning file
				newWarn = new WarningSchema({
					userID: member.user.id,
					guildID: guild.id,
					Reason: reason,
					Moderater: (userInput.member.id == member.user.id) ? bot.user.id : userInput.member.id,
					IssueDate: new Date().toUTCString(),
				});

				// save and send response to moderator
				await newWarn.save();
				const embed1 = new Embed(bot, userInput.guild)
					.setColor(15158332)
					.setAuthor({ name: guild.translate('moderation/warn:SUCCESS', { USER: member.user.displayName }), iconURL: member.user.displayAvatarURL() })
					.setDescription(guild.translate('moderation/warn:REASON', { REASON: reason }));

				// try and send warning embed to culprit
				const embed2 = new Embed(bot, guild)
					.setTitle('moderation/warn:TITLE')
					.setColor(15158332)
					.setThumbnail(guild.iconURL())
					.setDescription(guild.translate('moderation/warn:WARN_IN', { NAME: guild.name }))
					.addFields(
						{ name: guild.translate('moderation/warn:WARN_BY'), value: userInput.member.user.displayName, inline: true },
						{ name: guild.translate('misc:REASON'), value: reason, inline: true },
						{ name: guild.translate('moderation/warn:WARN_CNTR'), value: '1/3', inline: true },
					);

				// eslint-disable-next-line no-empty-function
				member.send({ embeds: [embed2] }).catch(() => {});

				// Check if the warning was only temporary
				checkTimedWarning(bot, reason, member, userInput, newWarn);
				return embed1;
			} catch (err) {
				bot.logger.error(`${err.message} when running command: warnings.`);
				return { error: ['misc:ERROR_MESSAGE', { ERROR: err.message }] };
			}
		} else {
			// This is NOT their first warning
			newWarn = new WarningSchema({
				userID: member.user.id,
				guildID: guild.id,
				Reason: reason,
				Moderater: (userInput.member.id == member.user.id) ? bot.user.id : userInput.member.id,
				IssueDate: new Date().toUTCString(),
			});

			// save and send response to moderator
			await newWarn.save();

			// mute user
			if (warnings.length == 1) {
				// Mutes user for 5 minutes
				await member.timeout(127000, 'Got a warning');

				// send embed
				const embed1 = new Embed(bot, guild)
					.setColor(15158332)
					.setAuthor({ name: guild.translate('moderation/warn:SUCCESS', { USER: member.user.displayName }), iconURL: member.user.displayAvatarURL() })
					.setDescription(guild.translate('moderation/warn:REASON', { REASON: reason }));
				if (bot.config.debug) bot.logger.debug(`${member.user.displayName} was warned for the second time in guild: ${guild.id}`);

				// try and send warning embed to culprit
				const embed2 = new Embed(bot, guild)
					.setTitle('moderation/warn:TITLE')
					.setColor(15158332)
					.setThumbnail(guild.iconURL())
					.setDescription(guild.translate('moderation/warn:WARN_IN', { NAME: guild.name }))
					.addFields(
						{ name: guild.translate('moderation/warn:WARN_BY'), value: userInput.member.user.displayName, inline: true },
						{ name: guild.translate('misc:REASON'), value: reason, inline: true },
						{ name: guild.translate('moderation/warn:WARN_CNTR'), value: '2/3', inline: true },
					);
				// eslint-disable-next-line no-empty-function
				member.send({ embeds: [embed2] }).catch(() => {});
				// Check if the warning was only temporary
				checkTimedWarning(bot, reason, member, userInput, newWarn);
				return embed1;
			} else {
				if (bot.config.debug) bot.logger.debug(`${member.user.displayName} was warned for the third time in guild: ${guild.id}`);
				// try and kick user from guild
				try {
					await guild.members.cache.get(member.user.id).kick(reason);
					await WarningSchema.collection.deleteOne({ userID: member.user.id, guildID: guild.id });
					return { success: ['moderation/warn:KICKED', { USER: member.user.displayName }] };
					// Delete user from database
				} catch (err) {
					bot.logger.error(`${err.message} when kicking user.`);
					return { error: ['misc:ERROR_MESSAGE', { ERROR: err.message }] };
				}
			}
		}
	} catch (err) {
		bot.logger.error(`Command: 'warn' has error: ${err.message}.`);
		return { error: ['misc:ERROR_MESSAGE', { ERROR: err.message }] };
	}
};

async function checkTimedWarning(bot, reason, member, userInput, newWarn) {
	const { guild, channel } = userInput;

	// check if warning is timed
	const possibleTime = reason.split(' ')[0];
	if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
		const time = getTotalTime(possibleTime);
		if (!time) return;
		// connect to database
		const newEvent = new timeEventSchema({
			userID: member.user.id,
			guildID: guild.id,
			time: new Date(new Date().getTime() + time),
			channelID: channel.id,
			type: 'warn',
		});
		await newEvent.save();

		// delete warning from user
		setTimeout(async () => {
			// Delete item from database as bot didn't crash
			await WarningSchema.findByIdAndRemove(newWarn._id);
			await timeEventSchema.findByIdAndRemove(newEvent._id);
		}, time);
	}

	// If logging is enabled send warning/kick embed to lodding channel
	await bot.emit('warning', member, newWarn);
}
