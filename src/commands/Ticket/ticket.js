// Dependencies
const { Embed } = require('../../utils'),
	{ MessageActionRow, MessageButton } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Ticket extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ticket',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['ticket'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
			description: 'Information on ticket plugin.',
			usage: 'ticket',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Add ticket reaction embed
		if (message.member.permissions.has('MANAGE_GUILD')) {
			if (message.args[0] == 'reaction') {
				const embed = new Embed(bot, message.guild)
					.setTitle('ticket/ticket:TITLE_REACT')
					.setDescription(message.translate('ticket/ticket:REACT_DESC', { PREFIX: settings.prefix }));
				// Create button
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('crt_ticket')
							.setLabel('Create ticket')
							.setStyle('SECONDARY')
							.setEmoji('📩'),
					);

				message.channel.send({ embeds: [embed], components: [row] });
			} else {
				const embed = new Embed(bot, message.guild)
					.setTitle('ticket/ticket:TITLE')
					.setDescription([
						`\`${settings.prefix}t-<open|create> [reason]\` - ${message.translate('ticket/ticket-create:DESCRIPTION')}.`,
						`\`${settings.prefix}t-close\` - ${message.translate('ticket/ticket-close:DESCRIPTION')} (Support only).`,
						`\`${settings.prefix}t-setup\` - ${message.translate('ticket/ticket-setup:DESCRIPTION')} (Admin only).`,
						`\`${settings.prefix}ticket reaction\` - Add reaction ticket embed (Admin only).`,
					].join('\n'));
				message.channel.send({ embeds: [embed] });
			}
		}
	}
};
