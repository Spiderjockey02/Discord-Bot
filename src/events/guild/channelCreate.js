// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

const types = {
	GUILD_TEXT: 'Text',
	GUILD_VOICE: 'Voice',
	GUILD_CATEGORY: 'Category',
	GUILD_STAGE_VOICE: 'Stage',
	GUILD_NEWS: 'Annoucement',
	GUILD_STORE: 'Store',
};

module.exports = class channelCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, channel) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Channel: ${channel.type == 'dm' ? channel.recipient.tag : channel.name} has been created${channel.type == 'dm' ? '' : ` in guild: ${channel.guild.id}`}. (${types[channel.type]})`);

		// Make sure the channel isn't a DM
		if (channel.type == 'dm') return;

		// Get server settings / if no settings then return
		const settings = channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELCREATE log
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(channel.name) && settings.ModLogEvents?.includes('TICKET')) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('CHANNELCREATE') && settings.ModLog) {
			const embed = new Embed(bot, channel.guild)
				.setDescription(`**${types[channel.type]} channel created: ${channel.toString()}**`)
				.setColor(3066993)
				.setFooter('misc:ID', { ID: channel.id })
				.setAuthor(bot.user.username, bot.user.displayAvatarURL())
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${channel.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == channel.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
