// Dependencies
const { Embed } = require('../../utils'),
	{ Collection } = require('discord.js'),
	cooldowns = new Collection(),
	Event = require('../../structures/Event');

module.exports = class clickButton extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, button) {
		const { customId: ID, guildId, channelId, member } = button,
			guild = bot.guilds.cache.get(guildId),
			channel = bot.channels.cache.get(channelId);

		// buttons are only used for ticket embed (for now)
		if (ID == 'crt_ticket') {
			// Make sure user isn't on cooldown from making a ticket
			const now = Date.now();
			const cooldownAmount = 3600000;

			if (cooldowns.has(member.user.id)) {
				const expirationTime = cooldowns.get(member.user.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000 / 60;
					return button.reply({ embeds: [channel.error('ticket/ticket-create:COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)] }).then(() => {
						setTimeout(function() {
							button.deleteReply();
						}, 5000);
					});
				}
			}

			// make sure ticket has been set-up properly
			const supportRole = guild.roles.cache.get(guild.settings.TicketSupportRole);
			if (!supportRole) return channel.error('ticket/ticket-create:NO_SUPPORT_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
			const category = guild.channels.cache.get(guild.settings.TicketCategory);
			if (!category) return channel.error('ticket/ticket-create:NO_CATEGORY').then(m => m.timedDelete({ timeout: 10000 }));

			// Make sure ticket dosen't already exist
			if (guild.channels.cache.find(c => c.name == `ticket-${member.user.id}`)) {
				button.reply({ embeds: [channel.error('ticket/ticket-create:TICKET_EXISTS', {}, true)] }).then(() => {
					setTimeout(function() {
						button.deleteReply();
					}, 5000);
				});
			}

			// create channel
			guild.channels.create(`ticket-${member.user.id}`, { type: 'text',
				reason: guild.translate('misc:NO_REASON'),
				parent: category.id,
				permissionOverwrites:[
					{ id: member.user, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
					{ id: supportRole, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
					{ id: guild.roles.everyone, deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
					{ id: bot.user, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS'] },
				] })
				.then(async c => {
				// reply to user saying that channel has been created
					const successEmbed = new Embed(bot, guild)
						.setTitle('ticket/ticket-create:TITLE')
						.setDescription(guild.translate('ticket/ticket-create:DESC', { CHANNEL: channel.id }));

					button.reply({ embeds: [successEmbed] }).then(() => {
						setTimeout(function() {
							button.deleteReply();
						}, 5000);
					});

					// Add message to ticket channel
					const embed = new Embed(bot, guild)
						.setColor(0xFF5555)
						.addField(guild.translate('ticket/ticket-create:FIELD1', { USERNAME: member.user.tag }), guild.translate('ticket/ticket-create:FIELDT'))
						.addField(guild.translate('ticket/ticket-create:FIELD2'), guild.translate('misc:NO_REASON'))
						.setTimestamp();
					c.send({ content: `${member.user}, ${supportRole}`, embeds: [embed] });

					// run ticketcreate event
					await bot.emit('ticketCreate', channel, embed);
				}).catch(err => {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				});

			cooldowns.set(member.user.id, now);
			setTimeout(() => cooldowns.delete(member.user.id), cooldownAmount);
		} else if (ID == 'cl_ticket') {
			// Make sure user has a ticket
			if (!guild.channels.cache.find(c => c.name == `ticket-${member.user.id}`)) {
				return button.reply({ embeds: [channel.error('ticket/ticket-close:MISSING_TICKET', {}, true)] }).then(() => {
					setTimeout(function() {
						button.deleteReply();
					}, 5000);
				});
			}

			// delete channel
			guild.channels.cache.find(c => c.name == `ticket-${member.user.id}`).delete().then(() => {
				button.reply({ embeds: [channel.success('ticket/ticket-close:SUCCESS', {}, true)] }).then(() => {
					setTimeout(function() {
						button.deleteReply();
					}, 5000);
				});
			});
		}
	}
};
