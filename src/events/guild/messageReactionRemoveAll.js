// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

module.exports = class messageReactionRemoveAll extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, message) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Message all reactions removed ${!message.guild ? '' : ` in guild: ${message.guild.id}`}`);

		// If message needs to be fetched
		try {
			if (message.partial) await message.fetch();
		} catch (err) {
			return bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Get server settings / if no settings then return
		const settings = message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event messageReactionRemove is for logging
		if (settings.ModLogEvents.includes('MESSAGEREACTIONREMOVEALL') && settings.ModLog) {
			const embed = new Embed(bot, message.guild)
				.setDescription(`**All reactions removed from [this message](${message.url})** `)
				.setColor(15158332)
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${message.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == message.guild.id) bot.addEmbed(modChannel.id, embed);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
