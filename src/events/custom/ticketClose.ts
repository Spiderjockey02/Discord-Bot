// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Ticket close event
 * @event Egglord#TickteClose
 * @extends {Event}
*/
class TicketClose extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {TextChannel} channel The ticket channel that closed
	 * @readonly
	*/
	async run(client, channel) {
		// Get server settings / if no settings then return
		const settings = channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// send ticket log (goes in ModLog channel)
		if (settings.ModLogEvents?.includes('TICKET') && settings.ModLog) {
			const embed = new Embed(client, channel.guild)
				.setTitle('ticket/ticket-close:TITLE')
				.setColor(15158332)
				.addFields(
					{ name: channel.guild.translate('ticket/ticket-close:TICKET'), value: channel.toString() },
					{ name: channel.guild.translate('ticket/ticket-close:USER'), value: `${client.users.cache.get(channel.name.split('-')[1])}` },
				)
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${channel.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == channel.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = TicketClose;
