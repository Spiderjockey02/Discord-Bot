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
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
			description: 'Information on ticket plugin.',
			usage: 'ticket',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check if bot has permission to add reactions
		if (!message.channel.permissionsFor(bot.user).has('ADD_REACTIONS')) {
			bot.logger.error(`Missing permission: \`ADD_REACTIONS\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'ADD_REACTIONS').then(m => m.delete({ timeout: 10000 }));
		}

		// Add ticket reaction embed
		if (message.member.hasPermission('MANAGE_GUILD')) {
			if (message.args[0] == 'reaction') {
				const embed = new MessageEmbed()
					.setTitle('React for Ticket channel')
					.setDescription(`You can react here or use the following command:\n \`${settings.prefix}t-open [reason]\`.`);
				message.channel.send(embed).then(async msg => {
					await msg.react('🎟');

					// set up filter and page number
					const filter = (reaction, user) => {
						return reaction.emoji.name == '🎟' && !user.bot;
					};
					// create collector
					const collector = msg.createReactionCollector(filter, { time: 604800000 });
					collector.on('collect', () => {
						bot.commands.get('ticket-create').run(bot, message, settings);
					});
				});
			} else {
				const embed = new MessageEmbed()
					.setTitle('Ticket help')
					.setDescription(`\`${settings.prefix}t-<open|create> [reason]\` - Will open a ticket for support.\n\`${settings.prefix}t-close\` - Will close the current ticket channel (Support only).\n\`${settings.prefix}t-setup\` - Sets up the ticket plugin (Admin only).\n\`${settings.prefix}ticket reaction\` - Add reaction ticket embed (Admin only).`);
				message.channel.send(embed);
			}
		}
	}
};
