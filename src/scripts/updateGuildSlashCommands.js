module.exports.run = async (bot) => {
	bot.logger.log(`=-=-=-=-=-=-=- Loading interactions for ${bot.guilds.cache.size} guilds -=-=-=-=-=-=-=`);

	// loop through each guild
	for (const guild of [...bot.guilds.cache.values()]) {
		const enabledPlugins = guild.settings.plugins;
		const data = [];

		// get slash commands for category
		for (const plugin of enabledPlugins) {
			const g = await bot.loadInteractionGroup(plugin, guild);
			if (Array.isArray(g)) data.push(...g);
		}

		// get context menus
		data.push({ name: 'Add to Queue', type: 'MESSAGE' },
			{ name: 'Translate', type: 'MESSAGE' },
			{ name: 'OCR', type: 'MESSAGE' },
			{ name: 'Avatar', type: 'USER' },
			{ name: 'Userinfo', type: 'USER' });

		try {
			await bot.guilds.cache.get(guild.id)?.commands.set(data);
			bot.logger.log('Loaded interactions for guild: ' + guild.name);
		} catch (err) {
			bot.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
		}
	}
	return 'complete';
};
