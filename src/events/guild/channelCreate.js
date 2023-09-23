// Dependencies
const { Embed } = require('../../utils'),
	{ ChannelType } = require('discord-api-types/v10'),
	Event = require('../../structures/Event');

/**
 * Channel create event
 * @event Egglord#ChannelCreate
 * @extends {Event}
*/
class ChannelCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {GuildChannel} channel The channel that was created
	 * @readonly
	*/
	async run(bot, channel) {
		const { type, guild, name } = channel;
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Channel: ${type == ChannelType.DM ? channel.recipient.displayName : name} has been created${type == ChannelType.DM ? '' : ` in guild: ${guild.id}`}. (${type})`);

		// Make sure the channel isn't a DM
		if (type == 'dm') return;

		// Get server settings / if no settings then return
		const settings = guild.settings;
		if (Object.keys(settings).length == 0) return;

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELCREATE log
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(name) && settings.ModLogEvents?.includes('TICKET')) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('CHANNELCREATE') && settings.ModLog) {
			const embed = new Embed(bot, guild)
				.setDescription(`**${guild.translate(`events/channel:${type}`)} ${guild.translate('events/channel:CREATE', { CHANNEL: channel.toString() })}**`)
				.setColor(3066993)
				.setFooter({ text: guild.translate('misc:ID', { ID: channel.id }) })
				.setAuthor({ name: bot.user.displayName, iconURL: bot.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${channel.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = ChannelCreate;
