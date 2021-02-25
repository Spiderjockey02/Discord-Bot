// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Ticket extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ticket',
			dirname: __dirname,
			aliases: ['ticket'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Open a support ticket.',
			usage: 'ticket <option> [reason]',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Make sure the bot has the correct permissions
		if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) {
			bot.logger.error(`Missing permission: \`MANAGE_CHANNELS\` in [${message.guild.id}].`);
			return message.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_CHANNELS').then(m => m.delete({ timeout: 10000 }));
		}

		if (!args[0]) {
			// Show available ticket sub-commands
			const embed = new MessageEmbed()
				.setTitle('Ticket help')
				.setDescription(`\`${settings.prefix}ticket <create|open> [reason]\` - will open a ticket for support.\n\`${settings.prefix}ticket close\` - will close the current ticket channel (Admin).\n\`${settings.prefix}ticket setup\` - set up the ticket command.`);
			message.channel.send(embed);
		} else if (args[0] == 'create' || args[0] == 'open') {
			// Will create a ticket channel

			// Check if a ticket channel is already open
			if (message.guild.channels.cache.find(channel => channel.name == `ticket-${message.author.id}`)) {
				return message.error(settings.Language, 'MODERATION/TICKET_EXISTS').then(m => m.delete({ timeout: 10000 }));
			}

			// make sure ticket has been set-up properly
			const supportRole = message.guild.roles.cache.find(role => role.id == settings.TicketSupportRole);
			if (!supportRole) return message.error(settings.Language, 'MODERATION/NO_SUPPORT_ROLE').then(m => m.delete({ timeout: 10000 }));

			// get reason
			const reason = (args.join(' ').slice(args[1].length)) ? args.join(' ').slice(args[1].length) : message.translate(settings.Language, 'NO_REASON');

			// create channel
			message.guild.channels.create(`ticket-${message.author.id}`, 'text').then(channel => {
				// get everyone role
				const everyoneRole = message.guild.roles.cache.find(role => role.name == '@everyone');
				// Category ID - Optional
				try {
					channel.setParent(settings.TicketCategory);
					// update permissions so only user and support role can see this
					channel.updateOverwrite(message.author, {
						SEND_MESSAGES: true,
						READ_MESSAGES: true,
						VIEW_CHANNEL: true,
					});
					channel.updateOverwrite(supportRole, {
						SEND_MESSAGES: true,
						READ_MESSAGES: true,
					});
					channel.updateOverwrite(everyoneRole, {
						SEND_MESSAGES: false,
						READ_MESSAGES: false,
					});
				} catch (e) {
					console.log(e);
				}
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
				bot.logger.error(err);
			});
		} else if (args[0] == 'close') {
			// will close the current ticket channel
			// get support role
			try {
				if (message.member.roles.cache.has(r => r.id == settings.TicketSupportRole) || message.member.permissionsIn(message.channel).has('MANAGE_CHANNELS')) {
					message.channel.delete();
				} else {
					return message.error(settings.Language, 'MODERATION/NOT_SUPPORT');
				}
			} catch (e) {
				console.log(e);
			}
		} else if (args[0] == 'setup') {
			if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_CHANNELS').then(m => m.delete({ timeout: 10000 }));
			// will setup the ticket command
			if (!args[1]) {
				const embed = new MessageEmbed()
					.setTitle('Ticket setup Help')
					.setDescription(`\`${settings.prefix}ticket setup category <channelID>\` - The parent of the channels \n\`${settings.prefix}ticket setup role <roleID>\` - The support role for accessing channels`);
				message.channel.send(embed);
			} else if (args[1] == 'category') {
				try {
					const channel = bot.channels.cache.get(args[2]);
					console.log(channel);
					if (!channel || channel.type != 'category') return message.channel.send('That is not a category.');
					// update database
					bot.updateGuild(message.guild, { TicketCategory: args[2] });
					message.channel.send('Updated category');
				} catch (e) {
					console.log(e);
				}
			} else if (args[1] == 'role') {
				const supportRole = message.guild.roles.cache.find(role => role.id == args[2]);
				if (!supportRole) return message.channel.send('That is not a role.');
				// update database
				bot.updateGuild(message.guild, { TicketSupportRole: args[2] });
				message.channel.send('Updated support');
			} else {
				message.channel.send('I can\'t help you on that');
			}
		} else {
			message.channel.send('Not an available sub-command.');
		}
	}
};
