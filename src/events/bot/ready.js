const { GuildSchema, PremiumSchema } = require('../../database/models'),
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
		// LOG ready event
		bot.logger.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=', 'ready');
		bot.logger.log(`${bot.user.tag}, ready to serve [${bot.users.cache.size}] users in [${bot.guilds.cache.size}] servers.`, 'ready');
		bot.logger.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=', 'ready');

		bot.appInfo = await bot.fetchApplication();

		// Load up audio player
		bot.manager.init(bot.user.id);

		setInterval(async () => {
			bot.appInfo = await bot.fetchApplication();
		}, 60000);

		// set up webserver
		try {
			require('../../http/api')(bot);
		} catch (err) {
			console.log(err);
		}

		// webhook manager
		setInterval(async () => {
			await require('../../helpers/webhookManager')(bot);
		}, 10000);

		// Updates the bot's status
		setTimeout(() => {
			bot.user.setStatus('Online');
			bot.SetActivity([`${bot.guilds.cache.size} servers!`, `${bot.users.cache.size} users!`], 'WATCHING');
		}, 3000);

		await require('../../scripts/update-commands.md.js')(bot);
		// Check if any servers added the bot while offline
		bot.guilds.cache.forEach(async item => {
			await item.fetchGuildConfig();
			if (item.settings == null) {
				// new guild has been found
				bot.emit('guildCreate', item);
			}
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
			for (let i = 0; i < data.length; i++) {
				if (!guildCount.includes(data[i].guildID)) {
					const guild = {
						id: `${data[i].guildID}`,
						name: `${data[i].guildName}`,
					};
					bot.emit('guildDelete', guild);
				}
			}
		}

		bot.logger.ready('All guilds have been initialized.');

		// Every 5 minutes fetch new guild data
		setInterval(async () => {
			if (bot.config.debug) bot.logger.debug('Fetching guild settings (Interval: 1 minutes)');
			bot.guilds.cache.forEach(async guild => {
				guild.fetchGuildConfig();
			});
		}, 60000);

		// check for premium users
		const premium = await PremiumSchema.find({});
		for (let i = 0; i < premium.length; i++) {
			if (premium[i].Type == 'user') {
				const user = await bot.users.fetch(premium[i].ID);
				if (user) user.premium = true;
			} else {
				const guild = bot.guilds.cache.get(premium[i].ID);
				if (guild) guild.premium = true;
			}
		}

		// enable time event handler (in case of bot restart)
		try {
			await require('../../helpers/TimedEventsManager')(bot);
		} catch (err) {
			console.log(err);
		}
	}
};
