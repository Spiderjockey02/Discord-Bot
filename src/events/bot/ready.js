const { GuildSchema, userSchema, TagsSchema } = require('../../database/models'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Event = require('../../structures/Event');

/**
 * Ready event
 * @event Egglord#Ready
 * @extends {Event}
*/
class Ready extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			once: true,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @readonly
	*/
	async run(bot) {
		// Load up audio player
		try {
			bot.manager.init(bot.user.id);
		} catch (err) {
			bot.logger.error(`Audio manager failed to load due to error: ${err.message}`);
		}

		// set up webserver
		try {
			await require('../../http')(bot);
		} catch (err) {
			console.log(err.message);
		}

		// webhook manager (loop every 10secs)
		setInterval(async () => {
			await require('../../helpers/webhookManager')(bot);
		}, 10000);

		for (const guild of [...bot.guilds.cache.values()]) {
			// Sort out guild settings
			await guild.fetchSettings();
			if (guild.settings == null) return bot.emit('guildCreate', guild);
			if (guild.settings.plugins.includes('Level')) await guild.fetchLevels();

			// Append tags to guild specific arrays
			if(guild.settings.PrefixTags) {
				TagsSchema.find({ guildID: guild.id }).then(result => {
					result.forEach(value => {
						guild.guildTags.push(value.name);
					});
				});
			}
		}

		// Delete server settings on servers that removed the bot while it was offline
		const data = await GuildSchema.find({});
		if (data.length > bot.guilds.cache.size) {
			// A server kicked the bot when it was offline
			const guildCount = [];
			// Get bot guild ID's
			for (let i = 0; i < bot.guilds.cache.size; i++) {
				guildCount.push([...bot.guilds.cache.values()][i].id);
			}
			// Now check database for bot guild ID's
			for (const guild of data) {
				if (!guildCount.includes(guild.guildID)) {
					bot.emit('guildDelete', { id: guild.guildID, name: guild.guildName });
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
		for (const { userID, premium, premiumSince, cmdBanned, rankImage } of users) {
			const user = await bot.users.fetch(userID);
			user.premium = premium;
			user.premiumSince = premiumSince ?? 0;
			user.cmdBanned = cmdBanned;
			user.rankImage = rankImage ? Buffer.from(rankImage ?? '', 'base64') : '';
		}


		// enable time event handler (in case of bot restart)
		try {
			await require('../../helpers/TimedEventsManager')(bot);
		} catch (err) {
			console.log(err);
		}

		// Make sure 'SupportServer' has Host commands
		if (bot.config.SupportServer.GuildID) {
			const guild = bot.guilds.cache.get(bot.config.SupportServer.GuildID);
			if (guild) {
				// Check if Main server already have 'Host' commands
				const guildCmds = await guild.commands.fetch();
				if (!(guildCmds.find(cmd => cmd.name == 'reload'))) {
					// Add host commands to Support server as they don't have them
					const cmds = await bot.loadInteractionGroup('Host', guild.id);
					for (const cmd of cmds) {
						cmd.defaultMemberPermissions = [Flags.Administrator];
					}
					if (Array.isArray(cmds)) await bot.guilds.cache.get(guild.id)?.commands.set(cmds);
					bot.logger.log(`Added Host commands to Support server: ${guild.id}.`);
				}
			} else {
				bot.logger.error('Bot is not in Support server.');
			}
		}


		// LOG ready event
		bot.logger.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=', 'ready');
		bot.logger.log(`${bot.user.tag}, ready to serve [${bot.users.cache.size}] users in [${bot.guilds.cache.size}] servers.`, 'ready');
		bot.logger.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=', 'ready');
	}
}

module.exports = Ready;
