// Dependencies
const { timeEventSchema, WarningSchema, MutedMemberSchema } = require('../database/models'),
	ms = require('ms'),
	{ Embed, time: { getTotalTime } } = require('../utils'),
	{ MessageAttachment } = require('discord.js');

module.exports = async (bot) => {
	const events = await timeEventSchema.find({});

	// loop every 3 seconds checking each item
	setInterval(async () => {
		// make sure there are events
		if (events.length == 0) return;

		// check each event
		for (let i = 0; i < events.length; i++) {
			// get settings for the guild
			const guild = bot.guilds.cache.get(events[i].guildID);
			// const settings = guild?.settings;
			const user = await bot.users.fetch(events[i].userID);

			if (new Date() >= new Date(events[i].time)) {
				switch(events[i].type) {
				case 'ban': {
					bot.logger.debug(`Unbanning ${user.tag} in guild: ${guild.id}.`);

					// unban user from guild
					try {
						const bans = await bot.guilds.cache.get(events[i].guildID).fetchBans();
						if (bans.size == 0) return;
						const bUser = bans.find(ban => ban.user.id == events[i].userID);
						if (!bUser) return;

						await guild.members.unban(bUser.user);
						const channel = bot.channels.cache.get(events[i].channelID);
						if (channel) await channel.success('moderation/unban:SUCCESS', { USER: user }).then(m => m.timedDelete({ timeout: 3000 }));
					} catch (err) {
						bot.logger.error(`Error: ${err.message} when trying to unban user. (timed event)`);
						bot.channels.cache.get(events[i].channelID)?.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
					}
					break;
				}
				case 'reminder': {
					bot.logger.debug(`Reminding ${bot.users.cache.get(events[i].userID).tag}`);

					// Message user about reminder
					const attachment = new MessageAttachment('./src/assets/imgs/Timer.png', 'Timer.png');
					const embed = new Embed(bot, guild)
						.setTitle('fun/reminder:TITLE')
						.setThumbnail('attachment://Timer.png')
						.setDescription(`${events[i].message}\n[${guild.translate('fun/reminder:DESC')}](https://discord.com/channels/${events[i].guildID}/${events[i].channelID}})`)
						.setFooter('fun/reminder:FOOTER', { TIME: ms(events[i].time, { long: true }) });
					try {
						await bot.users.cache.get(events[i].userID).send({ embeds: [embed], files: [attachment] });
					} catch (err) {
						bot.logger.error(`Error: ${err.message} when sending reminder to user. (timed event)`);
						bot.channels.cache.get(events[i].channelID)?.send(guild.translate('fun/reminder:RESPONSE', { USER: user.id, INFO: events[i].message }));
					}
					break;
				}
				case 'mute': {
					bot.logger.debug(`Unmuting ${user.tag} in guild: ${guild.id}.`);

					// get muted role
					const muteRole = guild.roles.cache.get(guild.settings.MutedRole);
					if (!muteRole) return bot.logger.error(`Muted role is missing in guild: ${guild.id}.`);

					// get member to unmute
					const member = await guild.members.fetch(user.id);

					// delete muted member from database (even if they not in guild anymore)
					await MutedMemberSchema.findOneAndRemove({ userID: member.user.id,	guildID: events[i].guildID });
					if (!member) return bot.logger.error(`Member is no longer in guild: ${bot.guilds.cache.get(events[i].guildID).id}.`);

					// update member
					try {
						await member.roles.remove(muteRole);
						// if in a VC unmute them
						if (member.voice.channelID) member.voice.setMute(false);
						bot.channels.cache.get(events[i].channelID)?.success('MODERATION/SUCCESSFULL_UNMUTE', member.user).then(m => m.timedDelete({ timeout: 3000 }));
					} catch (err) {
						bot.logger.error(`Error: ${err.message} when trying to unmute user. (timed event)`);
						bot.channels.cache.get(events[i].channelID)?.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
					}
					break;
				}
				case 'warn':
					// remove warning
					WarningSchema.find({
						userID: events[i].userID,
						guildID: events[i].guildID,
					}, async (err, res) => {
						if (err) {
							bot.logger.error(`Error: ${err.message} fetching warns. (timed events)`);
							return bot.channels.cache.get(events[i].channelID)?.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
						}

						// find the timed warning
						for (let j = 0; j < res.length; j++) {
							const possibleTime = res[j].Reason.split(' ')[0];
							if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
								const time = getTotalTime(possibleTime, this);
								// make sure time is correct
								if (time) {
									const a = new Date(res[j].IssueDate).getTime() + parseInt(time);
									const b = new Date(events[i].time).getTime();
									if (Math.abs(a, b) <= 4000) {
										// warning found, time to delete
										await WarningSchema.findByIdAndRemove(res[j]._id);
									}
								}
							}
						}
					});
					break;
				case 'premium': {
					// code block
					break;
				}
				default:
					// code block
					bot.logger.error(`Invalid event type: ${events[i].type}.`);
				}
			}
			// delete from 'cache'
			events.splice(events.indexOf(events[i]), 1);
		}
	}, 3000);
};
