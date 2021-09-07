// Dependencies
const { RankSchema } = require('../database/models'),
	levelcd = new Set();

class LevelManager {
	constructor(bot, message) {
		this.bot = bot;
		this.message = message;
	}

	async check() {
		const { channel, member, guild, guild: { settings } } = this.message;
		// Check if this was triggered by an ignored channel
		if (settings.LevelIgnoreChannel?.includes(channel.id)) return;

		const roles = member.roles.cache.map(r => r.id);
		if (roles.some(r => settings.LevelIgnoreRoles?.includes(r))) return;

		// Add a cooldown so people can't spam levels
		if (!levelcd.has(member.id)) {
			// calculate xp added
			const xpAdd = Math.round((Math.floor(Math.random() * 7) + 8) * settings.LevelMultiplier);

			// find user
			try {
				const res = await RankSchema.findOne({ userID: member.id, guildID: guild.id });

				// no account was found (this is user's first message with level plugin on)
				if (!res) {
					const newXp = new RankSchema({
						userID: member.id,
						guildID: guild.id,
						Xp: xpAdd,
						Level: 1,
					});
					await this._database(newXp);
				} else {
					// user was found
					res.Xp = res.Xp + xpAdd;
					const xpNeed = (5 * (res.Level ** 2) + 50 * res.Level + 100);
					// User has leveled up
					if (res.Xp >= xpNeed) {
						// now check how to send message
						res.Level = res.Level + 1;
						if (settings.LevelOption == 1) {
							channel.send(settings.LevelMessage.replace('{user}', this.message.author).replace('{level}', res.Level));
						} else if (settings.LevelOption == 2) {
							const lvlChannel = guild.channels.cache.get(settings.LevelChannel);
							if (lvlChannel) lvlChannel.send(settings.LevelMessage.replace('{user}', this.message.author).replace('{level}', res.Level));
						}
						if (this.bot.config.debug) this.bot.logger.debug(`${this.message.author.tag} has leveled up to ${res.Level} in guild: ${guild.id}.`);
					}

					// update database
					await this._database(res);
					this.UpdateCooldown(member.id);
				}
			} catch (err) {
				this.bot.logger.error(err.message);
			}
		}
	}

	async _database(doc) {
		try {
			doc.save()
				.then(() => {
					const res = this.message.guild.levels.find(({ userID }) => userID == this.message.author.id);
					if (res) {
						res.Xp = doc.Xp;
						res.Level = doc.Level;
					} else {
						this.message.guild.levels.push({ userID: this.message.author.id, guildID: this.message.guild.id, Xp: doc.Xp, Level: 1 });
					}
				});
		} catch (err) {
			this.bot.logger.error(err.message);
		}
	}

	UpdateCooldown(ID) {
		// add user to cooldown (1 minute cooldown)
		levelcd.add(ID);
		setTimeout(() => {
			levelcd.delete(ID);
		}, 60000);
	}
}

module.exports = LevelManager;
