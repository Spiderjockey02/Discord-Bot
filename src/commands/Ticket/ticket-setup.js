// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class TicketSetup extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ticket-setup',
			dirname: __dirname,
			aliases: ['t-setup', 'ticket-setup'],
			userPermissions: ['MANAGE_CHANNELS'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
			description: 'Setups the ticket plugin',
			usage: 'ticket-setup',
			cooldown: 3000,
			examples: ['t-setup category 783024613037703237', 't-setup role 766029837017153576'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// make sure user has permission to edit ticket plugin
		if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_CHANNELS').then(m => m.delete({ timeout: 10000 }));

		// will setup the ticket command
		if (!message.args[0]) {
			const embed = new MessageEmbed()
				.setTitle('Ticket setup Help')
				.setDescription(`\`${settings.prefix}ticket-setup category <channelID>\` - The parent of the channels \n\`${settings.prefix}ticket-setup role <roleID>\` - The support role for accessing channels`);
			message.channel.send(embed);
		} else if (message.args[0] == 'category') {

			// update category channel
			try {
				const channel = message.guild.channels.cache.get(message.args[1]);
				if (!channel || channel.type != 'category') return message.channel.send('That is not a category.');
				// update database
				await message.guild.updateGuild({ TicketCategory: message.args[1] });
				settings.TicketCategory = message.args[1];
				message.channel.send(`Updated Ticket category to: \`${channel.name}\`.`);
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
		} else if (message.args[0] == 'role') {

			// update support role
			try {
				const supportRole = message.guild.roles.cache.get(message.args[1]);
				if (!supportRole) return message.channel.send('That is not a role.');
				// update database
				await message.guild.updateGuild({ TicketSupportRole: message.args[1] });
				settings.TicketSupportRole = message.args[1];
				message.channel.send(`Updated support role to: ${supportRole}.`);
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
		}
	}
};
