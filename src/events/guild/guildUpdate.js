// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

module.exports = class guildUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, oldGuild, newGuild) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Guild: ${newGuild.name} has been updated.`);

		// Get server settings / if no settings then return
		const settings = newGuild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildUpdate is for logging
		if (settings.ModLog & settings.ModLogEvents.includes('GUILDUPDATE')) {
			let embed, updated = false;

			// Guild name change
			if (oldGuild.name != newGuild.name) {
				embed = new Embed(bot, newGuild)
					.setDescription('**Server name changed**')
					.setAuthor(newGuild.name, newGuild.iconURL())
					.addField('Before:', oldGuild.name)
					.addField('After:', newGuild.name)
					.setTimestamp();
				await newGuild.updateGuild({ guildName: newGuild.name });
				settings.guildName = newGuild.name;
				updated = true;
			}

			// region change
			if (oldGuild.region != newGuild.region) {
				embed = new Embed(bot, newGuild)
					.setDescription('**Server region changed**')
					.setAuthor(newGuild.name, newGuild.iconURL())
					.addField('Before:', oldGuild.region)
					.addField('After:', newGuild.region)
					.setTimestamp();
				updated = true;
			}

			// Server's boost level has changed
			if (oldGuild.premiumTier != newGuild.premiumTier) {
				embed = new Embed(bot, newGuild)
					.setDescription(`**Server boost ${oldGuild.premiumTier < newGuild.premiumTier ? 'increased' : 'decreased'}**`)
					.setAuthor(newGuild.name, newGuild.iconURL())
					.addField('Before:', oldGuild.premiumTier)
					.addField('After:', newGuild.premiumTier)
					.setTimestamp();
				updated = true;
			}

			// Server has got a new banner
			if (!oldGuild.banner && newGuild.banner) {
				embed = new Embed(bot, newGuild)
					.setDescription('**Server banner changed**')
					.setAuthor(newGuild.name, newGuild.iconURL())
					.addField('Before:', oldGuild.banner)
					.addField('After:', newGuild.banner)
					.setTimestamp();
				updated = true;
			}

			// Server has made a AFK channel
			if (!oldGuild.afkChannel && newGuild.afkChannel) {
				embed = new Embed(bot, newGuild)
					.setDescription('**Server AFK channel changed**')
					.setAuthor(newGuild.name, newGuild.iconURL())
					.addField('Before:', oldGuild.afkChannel)
					.addField('After:', newGuild.afkChannel)
					.setTimestamp();
				updated = true;
			}

			// Server now has a vanity URL
			if (!oldGuild.vanityURLCode && newGuild.vanityURLCode) {
				embed = new Embed(bot, newGuild)
					.setDescription('**Server Vanity URL changed**')
					.setAuthor(newGuild.name, newGuild.iconURL())
					.addField('Before:', oldGuild.vanityURLCode)
					.addField('After:', newGuild.vanityURLCode)
					.setTimestamp();
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newGuild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newGuild.id) bot.addEmbed(modChannel.id, embed);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
};
