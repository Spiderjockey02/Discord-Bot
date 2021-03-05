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
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// make sure user has permission to edit ticket plugin
		if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_CHANNELS').then(m => m.delete({ timeout: 10000 }));

		// will setup the ticket command
		if (!args[0]) {
			const embed = new MessageEmbed()
				.setTitle('Ticket setup Help')
				.setDescription(`\`${settings.prefix}ticket-setup category <channelID>\` - The parent of the channels \n\`${settings.prefix}ticket-setup role <roleID>\` - The support role for accessing channels`);
			message.channel.send(embed);
		} else if (args[0] == 'category') {
			try {
				const channel = message.guild.channels.cache.get(args[1]);
				if (!channel || channel.type != 'category') return message.channel.send('That is not a category.');
				// update database
				await message.guild.updateGuild({ TicketCategory: args[1] });
				message.channel.send(`Updated Ticket category to: \`${channel.name}\`.`);
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			}
		} else if (args[0] == 'role') {
			try {
				const supportRole = message.guild.roles.cache.find(role => role.id == args[1]);
				if (!supportRole) return message.channel.send('That is not a role.');
				// update database
				await message.guild.updateGuild({ TicketSupportRole: args[1] });
				message.channel.send(`Updated support role to: ${supportRole}.`);
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			}
		}
	}
};
