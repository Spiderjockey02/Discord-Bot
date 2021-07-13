const { GuildSchema, userSchema } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class Ready extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			once: true,
		});
	}

	// run event
	async run(bot) {
		// Load up audio player
		try {
			bot.manager.init(bot.user.id);
		} catch (err) {
			bot.logger.error(`Audio manager failed to load due to error: ${err.message}`);
		}

		// set up webserver
		try {
			require('../../http/api')(bot);
		} catch (err) {
			console.log(err.message);
		}

		// webhook manager (loop every 10secs)
		setInterval(async () => {
			await require('../../helpers/webhookManager')(bot);
		}, 10000);

		// Updates the bot's status
		// bot.user.setStatus('Online');
		// bot.SetActivity('WATCHING', [`${bot.guilds.cache.size} servers!`, `${bot.users.cache.size} users!`]);
		bot.guilds.cache.forEach(async guild => {
			await guild.fetchSettings();
			if (guild.settings == null) return bot.emit('guildCreate', guild);
			if (guild.settings.plugins.includes('Level')) await guild.fetchLevels();
		});

		// Delete server settings on servers that removed the bot while it was offline
		const data = await GuildSchema.find({});
		if (data.length > bot.guilds.cache.size) {
			// A server kicked the bot when it was offline
			const guildCount = [];
			// Get bot guild ID's
			for (let i = 0; i < bot.guilds.cache.size; i++) {
				guildCount.push(bot.guilds.cache.array()[i].id);
			}
			// Now check database for bot guild ID's
			for (const guild of data) {
				if (!guildCount.includes(guild.guildID)) {
					bot.emit('guildDelete', {
						id: `${guild.guildID}`,
						name: `${guild.guildName}`,
					});
				}
			}
		}

		bot.logger.ready('All guilds have been initialized.');

		// Every 1 minutes fetch new guild data
		setInterval(async () => {
			if (bot.config.debug) bot.logger.debug('Fetching guild settings (Interval: 1 minutes)');
			bot.guilds.cache.forEach(async guild => {
				await guild.fetchSettings();
			});
		}, 60000);

		// check for premium users
		const users = await userSchema.find({});
		for (let i = 0; i < users.length; i++) {
			const user = await bot.users.fetch(users[i].userID);
			// const userData = users[i];
			// user = { ...user, ...userData };
			user.premium = users[i].premium;
			user.premiumSince = users[i].premiumSince ?? 0;
			user.cmdBanned = users[i].cmdBanned;
			user.rankImage = users[i].rankImage ? Buffer.from(users[i].rankImage ?? '', 'base64') : '';
		}

		// enable time event handler (in case of bot restart)
		try {
			await require('../../helpers/TimedEventsManager')(bot);
		} catch (err) {
			console.log(err);
		}

		// LOG ready event
		bot.logger.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=', 'ready');
		bot.logger.log(`${bot.user.tag}, ready to serve [${bot.users.cache.size}] users in [${bot.guilds.cache.size}] servers.`, 'ready');
		bot.logger.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=', 'ready');
	}
};
