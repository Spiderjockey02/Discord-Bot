// Dependencies
const { Warning } = require('../modules/database/models');
const { MessageEmbed } = require('discord.js');

module.exports.run = (bot, message, member, wReason, settings) => {
	// retrieve user data in warning database
	Warning.findOne({
		userID: member.user.id,
		guildID: message.guild.id,
	}, async (err, res) => {
		if (err) bot.logger.error(err.message);

		// This is their first warning
		if (!res) {
			try {

				// create a new warning file
				const newWarn = new Warning({
					userID: member.user.id,
					guildID: message.guild.id,
					Warnings: 1,
					Reason: [`${wReason}`],
					Moderater: [`${(message.author.id == member.user.id) ? bot.user.id : message.author.id}`],
					IssueDates: [`${new Date().toUTCString()}`],
				});

				// save and send response to moderator
				await newWarn.save().catch(e => bot.logger.error(e.message));
				const embed = new MessageEmbed()
					.setColor(15158332)
					.setAuthor(message.translate(settings.Language, 'MODERATION/SUCCESSFULL_WARN', member.user.tag), member.user.displayAvatarURL())
					.setDescription(message.translate(settings.Language, 'MODERATION/REASON', wReason));
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
				message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
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
				let muteTime;
				const muteRole = message.guild.roles.cache.get(settings.MutedRole);
				if (muteRole) {
					// 5 minutes
					muteTime = 300000;
					await (member.roles.add(muteRole));
				}
				const embed = new MessageEmbed()
					.setColor(15158332)
					.setAuthor(message.translate(settings.Language, 'MODERATION/SUCCESSFULL_WARN', member.user.tag), member.user.displayAvatarURL())
					.setDescription(message.translate(settings.Language, 'MODERATION/REASON', wReason));
				message.channel.send(embed).then(m => m.delete({ timeout: 30000 }));
				// update database
				res.save().catch(e => console.log(e));
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
						member.roles.remove(muteRole).catch(e => console.log(e));
					}, muteTime);
				}
			} else {

				// try and kick user from guild
				try {
					await message.guild.member(member).kick(wReason);
					message.success(settings.Language, 'MODERATION/SUCCESSFULL_KWARNS', member.user.tag).then(m => m.delete({ timeout: 3500 }));
					// Delete user from database
					Warning.collection.deleteOne({ userID: member.user.id, guildID: message.guild.id });
				} catch (e) {
					bot.logger.error(`${err.message} when kicking user.`);
					message.error(settings.Language, 'MODERATION/TOO_POWERFUL').then(m => m.delete({ timeout: 10000 }));
				}
			}
		}

		// If lodding is enabled send warning/kick embed to lodding channel
		if (settings.ModLog == true) {
			const embed = new MessageEmbed()
				.setColor(15158332);
			if (res) {
				if (res.Warnings == 3) embed.setAuthor(`[KICK] ${member.user.username}#${member.user.discriminator}`, member.user.displayAvatarURL());
			} else {
				embed.setAuthor(`[WARN] ${member.user.username}#${member.user.discriminator}`, member.user.displayAvatarURL());
			}
			embed.addField('User:', `${member}`, true);
			embed.addField('Moderator:', `<@${message.author.id}>`, true);
			if (res) {
				if (res.Warnings != 3) {
					embed.addField('Warnings:', `${res.Warnings}`, true);
				}
			} else {
				bot.logger.log(`${member.user.tag} was warned from server: [${message.channel.guild.id}].`);
				embed.addField('Warnings:', '1', true);
			}
			embed.addField('Reason:', wReason);
			embed.setTimestamp();

			// find channel and send message
			const modChannel = message.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
			if (modChannel) modChannel.send(embed);
		}
	});
};
