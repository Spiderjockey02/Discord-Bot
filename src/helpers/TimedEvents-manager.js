// Dependencies
const { timeEventSchema, WarningSchema, PremiumSchema } = require('../database/models'),
	ms = require('ms'),
	{ MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = async (bot) => {
	const events = await timeEventSchema.find({});

	// loop every 3 seconds checking each item
	setInterval(async () => {
		// make sure there are events
		if (events.length == 0) return;

		// check each event
		for (let i = 0; i < events.length; i++) {
			// get settings for the guild
			const settings = bot.guilds.cache.get(events[i].guildID)?.settings;

			// check if current time is 'older' then event time.
			if (new Date() >= new Date(events[i].time)) {
				// if event type was reminder
				if (events[i].type == 'reminder') {
					bot.logger.debug(`Reminding ${bot.users.cache.get(events[i].userID).tag}`);
					// Message user about reminder
					const attachment = new MessageAttachment('./src/assets/imgs/Timer.png', 'Timer.png');
					const embed = new MessageEmbed()
						.setTitle(bot.translate(settings.Language, 'FUN/REMINDER_TITLE'))
						.setColor('RANDOM')
						.attachFiles(attachment)
						.setThumbnail('attachment://Timer.png')
						.setDescription(`${events[i].message}\n[${bot.translate(settings.Language, 'FUN/REMINDER_DESCRIPTION')}](https://discord.com/channels/${events[i].guildID}/${events[i].channelID})`)
						.setFooter(bot.translate(settings.Language, 'FUN/REMINDER_FOOTER', ms(events[i].time, { long: true })));
					try {
						await bot.users.cache.get(events[i].userID).send(embed);
					} catch (e) {
						const channel = bot.channels.cache.get(events[i].channelID);
						if (channel) channel.send(bot.translate(settings.Language, 'FUN/REMINDER_RESPONSE', [`\n**REMINDER:**\n ${bot.users.cache.get(events[i].userID)}`, `${events[i].message}`]));
					}
				} else if (events[i].type == 'ban') {
					// if event type was mute
					bot.logger.debug(`Unbanning ${bot.users.cache.get(events[i].userID).tag} in guild: ${bot.guilds.cache.get(events[i].guildID).id}.`);

					// unban user
					try {
						const bans = await bot.guilds.cache.get(events[i].guildID).fetchBans();
						if (bans.size == 0) return;
						const bUser = bans.find(ban => ban.user.id == events[i].userID);
						if (!bUser) return;

						bot.guilds.cache.get(events[i].guildID).members.unban(bUser.user);
						const channel = bot.channels.cache.get(events[i].channelID);
						if (channel) await channel.success(settings.Language, 'MODERATION/SUCCESSFULL_UNBAN', await bot.getUser(events[i].userID)).then(m => m.delete({ timeout: 3000 }));
					} catch (err) {
						bot.logger.error(`Error: ${err.message} when trying to unban user. (timed event)`);
						const channel = bot.channels.cache.get(events[i].channelID);
						if (channel) channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
					}
				} else if (events[i].type == 'mute') {
					// if event type was mute
					bot.logger.debug(`Unmuting ${bot.users.cache.get(events[i].userID).tag} in guild: ${bot.guilds.cache.get(events[i].guildID).id}.`);

					// get muted role
					const muteRole = bot.guilds.cache.get(events[i].guildID).roles.cache.get(settings.MutedRole);
					if (!muteRole) return bot.logger.error(`Muted role is missing in guild: ${bot.guilds.cache.get(events[i].guildID).id}.`);

					// get member to unmute
					const member = bot.guilds.cache.get(events[i].guildID).members.cache.get(events[i].userID);
					if (!member) return bot.logger.error(`Member is no longer in guild: ${bot.guilds.cache.get(events[i].guildID).id}.`);

					// update member
					try {
						await member.roles.remove(muteRole);
						// if in a VC unmute them
						if (member.voice.channelID) member.voice.setMute(false);

						const channel = bot.channels.cache.get(events[i].channelID);
						if (channel) await channel.success(settings.Language, 'MODERATION/SUCCESSFULL_UNMUTE', member.user).then(m => m.delete({ timeout: 3000 }));
					} catch (err) {
						bot.logger.error(`Error: ${err.message} when trying to unmute user. (timed event)`);
						const channel = bot.channels.cache.get(events[i].channelID);
						if (channel) channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
					}
				} else if (events[i].type == 'warn') {
					// remove warning
					WarningSchema.find({ userID: events[i].userID, guildID: events[i].guildID,
					}, async (err, res) => {
						if (err) {
							bot.logger.error(`Error: ${err.message} fetching warns. (timed events)`);
							return bot.channels.cache.get(events[i].channelID)?.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
						}

						// find the timed warning
						for (let j = 0; j < res.length; j++) {
							const possibleTime = res[j].Reason.split(' ')[0];
							if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
								const time = bot.timeFormatter.getTotalTime(possibleTime, this, settings.Language);
								// make sure time is correct
								if (time) {
									const a = new Date(res[j].IssueDate).getTime() + parseInt(time);
									const b = new Date(events[i].time).getTime();
									if (((a > b) ? (a - b) : (b - a)) <= 4000) {
										// warning found, time to delete
										await WarningSchema.findByIdAndRemove(res[j]._id);
									}
								}
							}
						}
					});
				} else if (events[i].type == 'premium') {
					// Delete premium 'Type' from DB
					await PremiumSchema.collection.deleteOne({
						ID: events[i].userID == 0 ? events[i].guildID : events[i].userID,
						Type: events[i].userID == 0 ? 'guild' : 'user' });

					events[i].userID == 0 ? bot.guilds.cache.get(events[i].guildID).premium = false : await bot.getUser(events[i].userID).then(user => user.premium = false);
				}

				// Delete from database as bot didn't crash
				await timeEventSchema.findByIdAndRemove(events[i]._id, (err) => {
					if (err) console.log(err);
				});

				// delete from 'cache'
				events.splice(events.indexOf(events[i]), 1);
			}
		}
	}, 3000);
};
