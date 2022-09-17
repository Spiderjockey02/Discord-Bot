// Dependencies
const { Embed } = require('../../utils'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Ticket create command
 * @extends {Command}
*/
class TicketCreate extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'ticket-create',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['t-create', 't-open'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
			description: 'Creates a ticket',
			usage: 'ticket-create [reason]',
			cooldown: 3000,
			examples: ['t-create Something isn\'t working'],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Check if a ticket channel is already open
		if (message.guild.channels.cache.find(channel => channel.name == `ticket-${message.author.id}`)) {
			return message.channel.error('ticket/ticket-create:TICKET_EXISTS').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// get reason
		const reason = (message.args[0]) ? message.args.join(' ') : message.translate('misc:NO_REASON');

		// create perm array
		const perms = [
			{ id: message.author, allow: [Flags.SendMessages, 'VIEW_CHANNEL'] },
			{ id: message.guild.roles.everyone, deny: [Flags.SendMessages, 'VIEW_CHANNEL'] },
			{ id: bot.user, allow: [Flags.SendMessages, 'VIEW_CHANNEL', Flags.EmbedLinks] },
		];
		if (message.guild.roles.cache.get(settings.TicketSupportRole)) perms.push({ id: settings.TicketSupportRole, allow: [Flags.SendMessages, 'VIEW_CHANNEL'] });

		// create channel
		try {
			const channel = await message.guild.channels.create(`ticket-${message.author.id}`, { type: 'text',
				reason: reason,
				parent: settings.TicketCategory,
				permissionOverwrites: perms });

			// reply to user saying that channel has been created
			const successEmbed = new Embed(bot, message.guild)
				.setTitle('ticket/ticket-create:TITLE')
				.setDescription(message.translate('ticket/ticket-create:DESC', { CHANNEL: channel.id }));
			message.channel.send({ embeds: [successEmbed] }).then(m => m.timedDelete({ timeout:10000 }));

			// Add message to ticket channel
			const embed = new Embed(bot, message.guild)
				.setColor(0xFF5555)
				.addFields(
					{ name: message.translate('ticket/ticket-create:FIELD1', { USERNAME: message.author.tag }), value: message.translate('ticket/ticket-create:FIELDT') },
					{ name: message.translate('ticket/ticket-create:FIELD2'), value: reason },
				)
				.setTimestamp();
			channel.send({ content: `${message.author}${message.guild.roles.cache.get(settings.TicketSupportRole) ? `, <@&${settings.TicketSupportRole}>` : ''}.`, embeds: [embed] });

			// run ticketcreate event
			bot.emit('ticketCreate', channel, embed);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = TicketCreate;
