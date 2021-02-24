const { Guild } = require('../modules/database/models');

module.exports = async bot => {
	// LOG ready event
	bot.logger.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=', 'ready');
	bot.logger.log(`${bot.user.tag}, ready to serve [${bot.users.cache.size}] users in [${bot.guilds.cache.size}] servers.`, 'ready');
	bot.logger.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=', 'ready');

	bot.appInfo = await bot.fetchApplication();

	// Load up audio player
	bot.manager.init(bot.user.id);

	// Load up discord bot
	try {
		await require('../helpers/DiscordBotListUpdate')(bot);
	} catch (err) {
		bot.logger.error(err.message);
	}

	setInterval(async () => {
		bot.appInfo = await bot.fetchApplication();
	}, 60000);

	// Updates the bot's status
	setTimeout(() => {
		bot.SetStatus('Online');
		bot.SetActivity([`${bot.guilds.cache.size} servers!`, `${bot.users.cache.size} users!`], 'WATCHING');
	}, 3000);


	// Check if any servers added the bot while offline
	bot.guilds.cache.forEach(async item => {
		await item.fetchGuildConfig();
		if (item.settings == null) {
			// new guild has been found
			bot.emit('guildCreate', item);
		}
	});

	// Delete server settings on servers that removed the bot while it was offline
	async function DeleteGuildCheck() {
		const data = await Guild.find({});
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
	}

	await DeleteGuildCheck();
	bot.logger.ready('All guilds have been initialized.');
};
