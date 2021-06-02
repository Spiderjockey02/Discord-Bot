// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class TicketSetup extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ticket-setup',
			guildOnly: true,
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
		// will setup the ticket command
		if (!message.args[0]) {
			const embed = new Embed(bot, message.guild)
				.setTitle('ticket/ticket-setup:TITLE')
				.setDescription(`\`${settings.prefix}ticket-setup category <channelID>\` - The parent of the channels \n\`${settings.prefix}ticket-setup role <roleID>\` - The support role for accessing channels`);
			message.channel.send(embed);
		} else if (message.args[0] == 'category') {

			// update category channel
			try {
				const channel = message.guild.channels.cache.get(message.args[1]);
				if (!channel || channel.type != 'category') return message.channel.send(message.translate('ticket/ticket-setup:NOT_CATEGORY'));
				// update database
				await message.guild.updateGuild({ TicketCategory: message.args[1] });
				settings.TicketCategory = message.args[1];
				message.channel.send(message.translate('ticket/ticket-setup:UPDATED_CATEGORY', { NAME: channel.name }));
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		} else if (message.args[0] == 'role') {

			// update support role
			try {
				const supportRole = message.guild.roles.cache.get(message.args[1]);
				if (!supportRole) return message.channel.send(message.translate('ticket/ticket-setup:NOT_ROLE'));
				// update database
				await message.guild.updateGuild({ TicketSupportRole: message.args[1] });
				settings.TicketSupportRole = message.args[1];
				message.channel.send(message.translate('ticket/ticket-setup:UPDATED_ROLE').replace('{ROLE}', supportRole));
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		}
	}
};
