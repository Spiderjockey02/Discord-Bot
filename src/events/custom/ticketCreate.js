// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Ticket create event
 * @event Egglord#TicketCreate
 * @extends {Event}
*/
class TicketCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {TextChannel} channel The ticket channel that opened
	 * @param {MessageEmbed} ticket The ticket that made the channel
	 * @readonly
	*/
	async run(bot, channel, ticket) {
		// Get server settings / if no settings then return
		const settings = channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// send ticket log (goes in ModLog channel)
		if (settings.ModLogEvents?.includes('TICKET') && settings.ModLog) {
			const embed = new Embed(bot, channel.guild)
				.setTitle('ticket/ticket-create:LOG_TITLE')
				.setColor(3066993)
				.addField(channel.guild.translate('ticket/ticket-create:TICKET'), `${channel}`)
				.addField(channel.guild.translate('ticket/ticket-create:USER'), `${bot.users.cache.get(channel.name.split('-')[1])}`, true)
				.addField(channel.guild.translate('ticket/ticket-create:FIELD2'), ticket.fields[1].value, true)
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

module.exports = TicketCreate;
