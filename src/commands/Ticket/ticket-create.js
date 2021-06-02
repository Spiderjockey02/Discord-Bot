// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class TicketCreate extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ticket-create',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['t-create', 't-open'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
			description: 'Creates a ticket',
			usage: 'ticket-create [reason]',
			cooldown: 3000,
			examples: ['t-create Something isn\'t working'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check if a ticket channel is already open
		if (message.guild.channels.cache.find(channel => channel.name == `ticket-${message.author.id}`)) {
			return message.channel.error('ticket/ticket-create:TICKET_EXISTS').then(m => m.delete({ timeout: 10000 }));
		}

		// make sure ticket has been set-up properly
		const supportRole = message.guild.roles.cache.get(settings.TicketSupportRole);
		if (!supportRole) return message.channel.error('ticket/ticket-create:NO_SUPPORT_ROLE').then(m => m.delete({ timeout: 10000 }));
		const category = message.guild.channels.cache.get(settings.TicketCategory);
		if (!category) return message.channel.error('ticket/ticket-create:NO_CATEGORY').then(m => m.delete({ timeout: 10000 }));

		// get reason
		const reason = (message.args[0]) ? message.args.join(' ') : message.translate('misc:NO_REASON');

		// create channel
		message.guild.channels.create(`ticket-${message.author.id}`, { type: 'text',
			reason: reason,
			parent: category.id,
			permissionOverwrites:[
				{ id:message.author, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
				{ id:supportRole, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
				{ id:message.guild.roles.everyone, deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
				{ id:bot.user, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS'] }] })
			.then(async channel => {
			// reply to user saying that channel has been created
				const successEmbed = new Embed(bot, message.guild)
					.setTitle('ticket/ticket-create:TITLE')
					.setDescription(message.translate('ticket/ticket-create:DESC').replace('{channel}', channel));
				message.channel.send(successEmbed).then(m => m.delete({ timeout:10000 }));

				// Add message to ticket channel
				const embed = new Embed()
					.setColor(0xFF5555)
					.addField(message.translate('ticket/ticket-create:FIELD1').replace('{username}', message.author.username), message.translate('ticket/ticket-create:FIELDT'))
					.addField(message.translate('ticket/ticket-create:FIELD2'), reason)
					.setTimestamp();
				channel.send(`${message.author}, ${supportRole}`, embed);

				// run ticketcreate event
				await bot.emit('ticketCreate', channel, embed);
			}).catch(err => {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			});
	}
};
