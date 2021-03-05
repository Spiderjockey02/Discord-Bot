// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class TicketCreate extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ticket-create',
			dirname: __dirname,
			aliases: ['t-create', 't-open'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
			description: 'Creates a ticket',
			usage: 'ticket-create',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Make sure bot has permission to create channel
		if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) {
			bot.logger.error(`Missing permission: \`MANAGE_CHANNELS\` in [${message.guild.id}].`);
			return message.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_CHANNELS').then(m => m.delete({ timeout: 10000 }));
		}

		// Check if a ticket channel is already open
		if (message.guild.channels.cache.find(channel => channel.name == `ticket-${message.author.id}`)) {
			return message.error(settings.Language, 'TICKET/TICKET_EXISTS').then(m => m.delete({ timeout: 10000 }));
		}

		// make sure ticket has been set-up properly
		const supportRole = message.guild.roles.cache.get(settings.TicketSupportRole);
		if (!supportRole) return message.error(settings.Language, 'TICKET/NO_SUPPORT_ROLE').then(m => m.delete({ timeout: 10000 }));
		const category = message.guild.channels.cache.get(settings.TicketCategory);
		if (!category) return message.error(settings.Language, 'TICKET/NO_CATEGORY').then(m => m.delete({ timeout:10000 }));

		// get reason
		const reason = (args[0]) ? args.join(' ') : message.translate(settings.Language, 'NO_REASON');

		// create channel
		message.guild.channels.create(`ticket-${message.author.id}`, { type: 'text',
			reason: 'User has created a ticket',
			parent: category.id,
			permissionOverwrites:[
				{ id:message.author, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
				{ id:supportRole, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
				{ id:message.guild.roles.everyone, deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
				{ id:bot.user, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS'] }] })
			.then(channel => {
			// reply to user saying that channel has been created
				const successEmbed = new MessageEmbed()
					.setTitle('✅ Success!')
					.setDescription(`Your ticket has been created: ${channel}`);
				message.channel.send(successEmbed).then(m => m.delete({ timeout:10000 }));

				// Add message to ticket channel
				const embed = new MessageEmbed()
					.setColor(0xFF5555)
					.addField(`Hey ${message.author.username}!`, 'Our support team will contact you as soon as possible.')
					.addField('Reason', reason)
					.setTimestamp();
				channel.send(embed);
				channel.send(`${message.author}`).then(m => m.delete({ timeout:1000 }));

				// send ticket log (goes in ModLog channel)
				if (settings.ModLogEvents.includes('TICKET') && settings.ModLog) {
					const ticketLog = new MessageEmbed()
						.setTitle('Ticket Opened!')
						.addField('Ticket', channel)
						.addField('User', message.author)
						.addField('Reason', reason)
						.setTimestamp();
					const modChannel = message.guild.channels.cache.find(c => c.id == settings.ModLogChannel);
					if (modChannel) modChannel.send(ticketLog);
				}
			}).catch(err => {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			});
	}
};
