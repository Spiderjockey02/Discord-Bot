// Dependencies
const { WarningSchema, timeEventSchema } = require('../database/models'),
	{ time: { getTotalTime }, Embed } = require('../utils');

module.exports.run = (bot, message, member, wReason, settings) => {
	// retrieve user data in warning database
	WarningSchema.find({
		userID: member.user.id,
		guildID: message.guild.id,
	}, async (err, res) => {
		if (err) {
			bot.logger.error(`Command: 'warn' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// This is their first warning
		let newWarn, embed;
		if (!res[0]) {
			// debugging mode
			if (bot.config.debug) bot.logger.debug(`${member.user.tag} was warned for the first time in guild: ${message.guild.id}`);

			try {
				// create a new warning file
				newWarn = new WarningSchema({
					userID: member.user.id,
					guildID: message.guild.id,
					Reason: wReason,
					Moderater: (message.author.id == member.user.id) ? bot.user.id : message.author.id,
					IssueDate: new Date().toUTCString(),
				});

				// save and send response to moderator
				await newWarn.save();
				embed = new Embed(bot, message.guild)
					.setColor(15158332)
					.setAuthor({ name: message.translate('moderation/warn:SUCCESS', { USER: member.user.tag }), iconURL: member.user.displayAvatarURL() })
					.setDescription(message.translate('moderation/warn:REASON', { REASON: wReason }));
				message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 30000 }));

				// try and send warning embed to culprit
				embed = new Embed(bot, message.guild)
					.setTitle('moderation/warn:TITLE')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(message.translate('moderation/warn:WARN_IN', { NAME: message.guild.name }))
					.addField(message.translate('moderation/warn:WARN_BY'), message.author.tag, true)
					.addField(message.translate('misc:REASON'), wReason, true)
					.addField(message.translate('moderation/warn:WARN_CNTR'), '1/3');
				// eslint-disable-next-line no-empty-function
				member.send({ embeds: [embed] }).catch(() => {});

			} catch (err) {
				bot.logger.error(`${err.message} when running command: warnings.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			// This is NOT their first warning
			newWarn = new WarningSchema({
				userID: member.user.id,
				guildID: message.guild.id,
				Reason: wReason,
				Moderater: (message.author.id == member.user.id) ? bot.user.id : message.author.id,
				IssueDate: new Date().toUTCString(),
			});

			// save and send response to moderator
			await newWarn.save();

			// mute user
			if (res.length + 1 == 2) {
				// Mutes user
				message.args = [member.user.id, '5m'];
				bot.commands.get('mute').run(bot, message, settings);

				// send embed
				embed = new Embed(bot, message.guild)
					.setColor(15158332)
					.setAuthor({ name: message.translate('moderation/warn:SUCCESS', { USER: member.user.tag }), iconURL: member.user.displayAvatarURL() })
					.setDescription(message.translate('moderation/warn:REASON', { REASON: wReason }));
				message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 30000 }));
				if (bot.config.debug) bot.logger.debug(`${member.user.tag} was warned for the second time in guild: ${message.guild.id}`);

				// try and send warning embed to culprit
				embed = new Embed(bot, message.guild)
					.setTitle('moderation/warn:TITLE')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(message.translate('moderation/warn:WARN_IN', { NAME: message.guild.name }))
					.addField(message.translate('moderation/warn:WARN_BY'), message.author.tag, true)
					.addField(message.translate('misc:REASON'), wReason, true)
					.addField(message.translate('moderation/warn:WARN_CNTR'), '2/3');
				// eslint-disable-next-line no-empty-function
				member.send({ embeds: [embed] }).catch(() => {});
			} else {
				if (bot.config.debug) bot.logger.debug(`${member.user.tag} was warned for the third time in guild: ${message.guild.id}`);
				// try and kick user from guild
				try {
					await message.guild.members.cache.get(member.user.id).kick(wReason);
					await WarningSchema.collection.deleteOne({ userID: member.user.id, guildID: message.guild.id });
					message.channel.success('moderation/warn:KICKED', { USER: member.user.tag }).then(m => m.timedDelete({ timeout: 3500 }));
					// Delete user from database
				} catch (err) {
					bot.logger.error(`${err.message} when kicking user.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}
			}
		}

		// check if warning is timed
		const possibleTime = wReason.split(' ')[0];
		if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
			const time = getTotalTime(possibleTime, message);
			if (!time) return;
			// connect to database
			const newEvent = new timeEventSchema({
				userID: member.user.id,
				guildID: message.guild.id,
				time: new Date(new Date().getTime() + time),
				channelID: message.channel.id,
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
	});
};
