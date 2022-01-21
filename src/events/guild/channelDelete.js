// Dependencies
const { Embed } = require('../../utils'),
	types = {
		GUILD_TEXT: 'Text',
		GUILD_VOICE: 'Voice',
		GUILD_CATEGORY: 'Category',
		GUILD_STAGE_VOICE: 'Stage',
		GUILD_NEWS: 'Annoucement',
		GUILD_STORE: 'Store',
	},
	Event = require('../../structures/Event');

/**
 * Channel delete event
 * @event Egglord#ChannelDelete
 * @extends {Event}
*/
class ChannelDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {GuildChannel|DMChannel} channel The channel that was deleted
	 * @readonly
	*/
	async run(bot, channel) {
	// For debugging
		if (bot.config.debug) bot.logger.debug(`Channel: ${channel.type == 'dm' ? channel.recipient.tag : channel.name} has been deleted${channel.type == 'dm' ? '' : ` in guild: ${channel.guild.id}`}. (${types[channel.type]})`);

		// Don't really know but a check for DM must be made
		if (channel.type == 'dm') return;

		// Get server settings / if no settings then return
		const settings = channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELDELETE log
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(channel.name) && settings.ModLogEvents?.includes('TICKET')) return bot.emit('ticketClose', channel);

		// Check if event channelDelete is for logging
		if (settings.ModLogEvents?.includes('CHANNELDELETE') && settings.ModLog) {
			const embed = new Embed(bot, channel.guild)
				.setDescription(`**${types[channel.type]} channel deleted: ${'#' + channel.name}**`)
				.setColor(15158332)
				.setFooter({ text: `ID: ${channel.id}` })
				.setAuthor({ name: bot.user.username, iconURL: bot.user.displayAvatarURL() })
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
}

module.exports = ChannelDelete;
