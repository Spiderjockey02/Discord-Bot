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
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {TextChannel} channel The ticket channel that opened
	 * @param {MessageEmbed} ticket The ticket that made the channel
	 * @readonly
	*/
	async run(client, channel, ticket) {
		// Get server settings / if no settings then return
		const settings = channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// send ticket log (goes in ModLog channel)
		if (settings.ModLogEvents?.includes('TICKET') && settings.ModLog) {
			const embed = new Embed(client, channel.guild)
				.setTitle('ticket/ticket-create:LOG_TITLE')
				.setColor(3066993)
				.addFields(
					{ name: channel.guild.translate('ticket/ticket-create:TICKET'), value: channel.toString() },
					{ name: channel.guild.translate('ticket/ticket-create:TICKET'), value: `${client.users.cache.get(channel.name.split('-')[1])}`, inline: true },
					{ name: channel.guild.translate('ticket/ticket-create:TICKET'), value: ticket.fields[1].value, inline: true },
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

module.exports = TicketCreate;
