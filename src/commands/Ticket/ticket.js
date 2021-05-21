// Dependencies
const { Embed } = require('../../utils'),
	{ ticketEmbedSchema } = require('../../database/models'),
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
		if (message.member.hasPermission('MANAGE_GUILD')) {
			if (message.args[0] == 'reaction') {
				const embed = new Embed(bot, message.guild)
					.setTitle('ticket/ticket:TITLE_REACT')
					.setDescription(message.translate('ticket/ticket:REACT_DESC', { PREFIX: settings.prefix }));
				message.channel.send(embed).then(async msg => {
					// add reaction
					await msg.react('🎟');

					// update database (in case bot restarts and reactionCollector will stop working)
					const newEmbed = await new ticketEmbedSchema({
						messageID: msg.id,
						channelID: msg.channel.id,
						guildID: msg.guild.id,
					});
					await newEmbed.save();
				});
			} else {
				const embed = new Embed(bot, message.guild)
					.setTitle('ticket/ticket:TITLE')
					.setDescription([
						`\`${settings.prefix}t-<open|create> [reason]\` - Will open a ticket for support.`,
						`\`${settings.prefix}t-close\` - Will close the current ticket channel (Support only).`,
						`\`${settings.prefix}t-setup\` - Sets up the ticket plugin (Admin only).`,
						`\`${settings.prefix}ticket reaction\` - Add reaction ticket embed (Admin only).`,
					].join('\n'));
				message.channel.send(embed);
			}
		}
	}
};
