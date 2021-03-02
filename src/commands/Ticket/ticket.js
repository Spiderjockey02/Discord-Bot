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
			description: 'Information on ticket plugin.',
			usage: 'ticket',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		const embed = new MessageEmbed()
			.setTitle('Ticket help')
			.setDescription(`\`${settings.prefix}t-<open|create> [reason]\` - Will open a ticket for support.\n\`${settings.prefix}t-close\` - Will close the current ticket channel (Support only).\n\`${settings.prefix}t-setup\` - Sets up the ticket plugin (Admin only).`);
		message.channel.send(embed);
	}
};
