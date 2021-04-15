// Dependencies
const { WarningSchema } = require('../database/models'),
	{ MessageEmbed } = require('discord.js');

module.exports.run = (bot, message, member, wReason, settings) => {
	// retrieve user data in warning database
	WarningSchema.findOne({
		userID: member.user.id,
		guildID: message.guild.id,
	}, async (err, res) => {
		if (err) {
			bot.logger.error(`Command: 'warn' has error: ${err.message}.`);
			return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}

		// This is their first warning
		if (!res) {
			// debugging mode
			if (bot.config.debug) bot.logger.debug(`${member.user.tag} was warned for the first time in guild: ${message.guild.id}`);

			try {
				// create a new warning file
				const newWarn = new WarningSchema({
					userID: member.user.id,
					guildID: message.guild.id,
					Warnings: 1,
					Reason: [`${wReason}`],
					Moderater: [`${(message.author.id == member.user.id) ? bot.user.id : message.author.id}`],
					IssueDates: [`${new Date().toUTCString()}`],
				});

				// save and send response to moderator
				await newWarn.save();
				const embed = new MessageEmbed()
					.setColor(15158332)
					.setAuthor(bot.translate(settings.Language, 'MODERATION/SUCCESSFULL_WARN', member.user.tag), member.user.displayAvatarURL())
					.setDescription(bot.translate(settings.Language, 'MODERATION/REASON', wReason));
				message.channel.send(embed).then(m => m.delete({ timeout: 30000 }));

				// try and send warning embed to culprit
				try {
					const embed2 = new MessageEmbed()
						.setTitle('WARNING')
						.setColor(15158332)
						.setThumbnail(message.guild.iconURL())
						.setDescription(`You have been warned in ${message.guild.name}.`)
						.addField('Warned by:', message.author.tag, true)
						.addField('Reason:', wReason, true)
						.addField('Warnings:', '1/3');
					member.send(embed2);
					// eslint-disable-next-line no-empty
				} catch (e) {}

			} catch (err) {
				bot.logger.error(`${err.message} when running command: warnings.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
		} else {
			// This is NOT their warning
			res.Warnings++;
			res.Reason.push(wReason);
			res.IssueDates.push(new Date().toUTCString());
			res.Moderater.push(message.author.id);

			// mute user
			if (res.Warnings == 2) {
				// Mutes user
				const muteRole = message.guild.roles.cache.get(settings.MutedRole);
				if (muteRole) await member.roles.add(muteRole).catch(err => bot.logger.error(err.message));

				// send embed
				const embed = new MessageEmbed()
					.setColor(15158332)
					.setAuthor(bot.translate(settings.Language, 'MODERATION/SUCCESSFULL_WARN', member.user.tag), member.user.displayAvatarURL())
					.setDescription(bot.translate(settings.Language, 'MODERATION/REASON', wReason));
				message.channel.send(embed).then(m => m.delete({ timeout: 30000 }));
				// update database
				await res.save();
				if (bot.config.debug) bot.logger.debug(`${member.user.tag} was warned for the second time in guild: ${message.guild.id}`);

				// try and send warning embed to culprit
				try {
					const embed2 = new MessageEmbed()
						.setTitle('WARNING')
						.setColor(15158332)
						.setThumbnail(message.guild.iconURL())
						.setDescription(`You have been warned in ${message.guild.name}.`)
						.addField('Warned by:', message.author.tag, true)
						.addField('Reason:', wReason, true)
						.addField('Warnings:', '2/3');
					member.send(embed2);
					// eslint-disable-next-line no-empty
				} catch (e) {}

				// remove role after time
				if (muteRole) {
					setTimeout(() => {
						member.roles.remove(muteRole).catch(err => bot.logger.error(err.message));
					}, 5 * 60000);
				}
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

		// If lodding is enabled send warning/kick embed to lodding channel
		if (settings.ModLog) {
			const embed = new MessageEmbed()
				.setColor(15158332);
			if (res) {
				if (res.Warnings == 3) embed.setAuthor(`[KICK] ${member.user.tag}`, member.user.displayAvatarURL());
			} else {
				embed.setAuthor(`[WARN] ${member.user.tag}`, member.user.displayAvatarURL());
			}
			embed.addField('User:', `${member}`, true);
			embed.addField('Moderator:', `<@${message.author.id}>`, true);
			if (res) {
				if (res.Warnings != 3) {
					embed.addField('Warnings:', `${res.Warnings}`, true);
				}
			} else {
				bot.logger.log(`${member.user.tag} was warned from server: [${message.guild.id}].`);
				embed.addField('Warnings:', '1', true);
			}
			embed.addField('Reason:', wReason);
			embed.setTimestamp();

			// find channel and send message
			const modChannel = message.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
		}
	});
};
