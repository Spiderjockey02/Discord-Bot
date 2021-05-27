// Dependencies
const { RankSchema } = require('../database/models');
const levelcd = new Set();

module.exports.run = (bot, message, settings) => {
	// Check if this was triggered by an ignored channel
	if (settings.LevelIgnoreChannel.includes(message.channel.id)) return;

	const roles = message.member.roles.cache.map(r => r.id);
	if (roles.some(r => settings.LevelIgnoreRoles.includes(r))) return;

	// Add a cooldown so people can't spam levels
	if (!levelcd.has(message.author.id)) {
		// calculate xp added
		const xpAdd = Math.round((Math.floor(Math.random() * 7) + 8) * settings.LevelMultiplier);

		// find user
		RankSchema.findOne({
			userID: message.author.id,
			guildID: message.guild.id,
		}, (err, Xp) => {
			if (err) bot.logger.error(err);
			// no account was found (this is user's first message with level plugin on)
			if (!Xp) {
				const newXp = new RankSchema({
					userID: message.author.id,
					guildID: message.guild.id,
					Xp: xpAdd,
					Level: 1,
				});
				newXp.save().catch(err => bot.logger.error(err.message));
			} else {
				// user was found
				Xp.Xp = Xp.Xp + xpAdd;
				const xpNeed = (5 * (Xp.Level ** 2) + 50 * Xp.Level + 100);

				// User has leveled up
				if (Xp.Xp >= xpNeed) {
					// now check how to send message
					Xp.Level = Xp.Level + 1;
					if (settings.LevelOption == 1) {
						message.channel.send(settings.LevelMessage.replace('{user}', message.author).replace('{level}', Xp.Level));
					} else if (settings.LevelOption == 2) {
						const lvlChannel = message.guild.channels.cache.get(settings.LevelChannel);
						if (lvlChannel) lvlChannel.send(settings.LevelMessage.replace('{user}', message.author).replace('{level}', Xp.Level));
					}
					if (bot.config.debug) bot.logger.debug(`${message.author.tag} has leveled up to ${Xp.Level} in guild: ${message.guild.id}.`);
				}

				// update database
				Xp.save().catch(err => bot.logger.error(err.message));
			}
		});

		// add user to cooldown (1 minute cooldown)
		levelcd.add(message.author.id);
		setTimeout(() => {
			levelcd.delete(message.author.id);
		}, 60000);
	}
};
