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

		try {
			await bot.guilds.cache.get(guild.id)?.commands.set(data);
			/*	ADD THIS WHEN MODERATION SLASH COMMANDS ARE ADDED
				.then(async interactionIDs => {
					if (guild.settings.plugins.find(plugin => plugin === 'Moderation')) {
						const category = (await readdir('./src/commands/Moderation/')).filter((v, i, a) => a.indexOf(v) === i);
						const lockedInteractions = [];
						const permissions = [];

						guild.settings.ModeratorRoles.forEach(roleID => {
							const role = guild.roles.cache.get(roleID);
							if (role) permissions.push({ id: role.id, type: 'ROLE', permission: true });
						});
						if (permissions.length >= 1) {
							category.forEach(async (cmd) => {
								if (!bot.config.disabledCommands.includes(cmd.replace('.js', ''))) {
									const interactionID = interactionIDs.find(interactionCmd => interactionCmd.name === cmd.replace('.js', ''));
									if (interactionID) lockedInteractions.push({ id: interactionID.id, permissions: permissions });
								}
							});
							guild.commands.setPermissions(lockedInteractions);
						}
					}
				});
			*/
			bot.logger.log('Loaded interactions for guild: ' + guild.name);
		} catch (err) {
			bot.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
		}
	}
	return 'complete';
};
