// Dependencies
const { timeEventSchema, WarningSchema } = require('../database/models'),
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
		for (const event of events) {
			// get settings for the guild
			const guild = bot.guilds.cache.get(event.guildID);
			const user = await bot.users.fetch(event.userID);

			if (new Date() >= new Date(event.time)) {
				switch(event.type) {
				case 'ban': {
					bot.logger.debug(`Unbanning ${user.tag} in guild: ${guild.id}.`);

					// unban user from guild
					try {
						const bans = await bot.guilds.cache.get(event.guildID).bans.fetch();
						if (bans.size == 0) return;
						const bUser = bans.find(ban => ban.user.id == event.userID);
						if (!bUser) return;

						await guild.members.unban(bUser.user);
						const channel = bot.channels.cache.get(event.channelID);
						if (channel) await channel.success('moderation/unban:SUCCESS', { USER: user }).then(m => m.timedDelete({ timeout: 3000 }));
					} catch (err) {
						bot.logger.error(`Error: ${err.message} when trying to unban user. (timed event)`);
						bot.channels.cache.get(event.channelID)?.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
					}
					break;
				}
				case 'reminder': {
					bot.logger.debug(`Reminding ${bot.users.cache.get(event.userID).tag}`);

					// Message user about reminder
					const attachment = new MessageAttachment('./src/assets/imgs/Timer.png', 'Timer.png');
					const embed = new Embed(bot, guild)
						.setTitle('fun/reminder:TITLE')
						.setThumbnail('attachment://Timer.png')
						.setDescription(`${event.message}\n[${guild.translate('fun/reminder:DESC')}](https://discord.com/channels/${event.guildID}/${event.channelID}})`)
						.setFooter({ text: guild.translate('fun/reminder:FOOTER', { TIME: ms(event.time, { long: true }) }) });
					try {
						await bot.users.cache.get(event.userID).send({ embeds: [embed], files: [attachment] });
					} catch (err) {
						bot.logger.error(`Error: ${err.message} when sending reminder to user. (timed event)`);
						bot.channels.cache.get(event.channelID)?.send(guild.translate('fun/reminder:RESPONSE', { USER: user.id, INFO: event.message }));
					}
					break;
				}
				case 'warn':
					// remove warning
					try {
						const res = await WarningSchema.find({ userID: event.userID, guildID: event.guildID });
						console.log(res);
						// find the timed warning
						for (const warn of res) {
							const possibleTime = warn.Reason.split(' ')[0];
							if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
								const time = getTotalTime(possibleTime, this);
								// make sure time is correct
								if (time) {
									const a = new Date(warn.IssueDate).getTime() + parseInt(time);
									const b = new Date(event.time).getTime();
									console.log(new Date(Math.abs(a, b)).getSeconds());
									if (Math.abs(a, b) <= 4000) {
										// warning found, time to delete
										await WarningSchema.findByIdAndRemove(warn._id);
									}
								}
							}
						}
					} catch (err) {
						bot.logger.error(`Error: ${err.message} fetching warns. (timed events)`);
						return bot.channels.cache.get(event.channelID)?.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
					}
					break;
				case 'premium': {
					// code block
					break;
				}
				default:
					// code block
					bot.logger.error(`Invalid event type: ${event.type}.`);
				}
			}
			// delete from 'cache'
			events.splice(events.indexOf(event), 1);
		}
	}, 3000);
};
