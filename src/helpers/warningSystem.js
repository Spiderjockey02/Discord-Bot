// Dependencies
const { WarningSchema, timeEventSchema } = require('../database/models'),
	{ MessageEmbed } = require('discord.js');

module.exports.run = (bot, message, member, wReason, settings) => {
	// retrieve user data in warning database
	WarningSchema.find({
		userID: member.user.id,
		guildID: message.guild.id,
	}, async (err, res) => {
		if (err) {
			bot.logger.error(`Command: 'warn' has error: ${err.message}.`);
			return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}

		// This is their first warning
		let newWarn;
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
				const embed = new MessageEmbed()
					.setColor(15158332)
					.setAuthor(bot.translate(settings.Language, 'MODERATION/SUCCESSFULL_WARN', member.user.tag), member.user.displayAvatarURL())
					.setDescription(bot.translate(settings.Language, 'MODERATION/REASON', wReason));
				message.channel.send(embed).then(m => m.delete({ timeout: 30000 }));

				// try and send warning embed to culprit
				const embed2 = new MessageEmbed()
					.setTitle('WARNING')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(`You have been warned in ${message.guild.name}.`)
					.addField('Warned by:', message.author.tag, true)
					.addField('Reason:', wReason, true)
					.addField('Warnings:', '1/3');
				// eslint-disable-next-line no-empty-function
				member.send(embed2).catch(() => {});

			} catch (err) {
				bot.logger.error(`${err.message} when running command: warnings.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
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
				const embed = new MessageEmbed()
					.setColor(15158332)
					.setAuthor(bot.translate(settings.Language, 'MODERATION/SUCCESSFULL_WARN', member.user.tag), member.user.displayAvatarURL())
					.setDescription(bot.translate(settings.Language, 'MODERATION/REASON', wReason));
				message.channel.send(embed).then(m => m.delete({ timeout: 30000 }));
				if (bot.config.debug) bot.logger.debug(`${member.user.tag} was warned for the second time in guild: ${message.guild.id}`);

				// try and send warning embed to culprit
				const embed2 = new MessageEmbed()
					.setTitle('WARNING')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(`You have been warned in ${message.guild.name}.`)
					.addField('Warned by:', message.author.tag, true)
					.addField('Reason:', wReason, true)
					.addField('Warnings:', '2/3');
					// eslint-disable-next-line no-empty-function
				member.send(embed2).catch(() => {});
			} else {
				if (bot.config.debug) bot.logger.debug(`${member.user.tag} was warned for the third time in guild: ${message.guild.id}`);
				// try and kick user from guild
				try {
					await message.guild.member(member).kick(wReason);
					await WarningSchema.collection.deleteOne({ userID: member.user.id, guildID: message.guild.id });
					message.channel.success(settings.Language, 'MODERATION/SUCCESSFULL_KWARNS', member.user.tag).then(m => m.delete({ timeout: 3500 }));
					// Delete user from database
				} catch (e) {
					bot.logger.error(`${err.message} when kicking user.`);
					message.channel.error(settings.Language, 'MODERATION/TOO_POWERFUL', err.message).then(m => m.delete({ timeout: 10000 }));
				}
			}
		}

		// check if warning is timed
		const possibleTime = wReason.split(' ')[0];
		if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
			const time = bot.timeFormatter.getTotalTime(possibleTime, message, settings.Language);
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
