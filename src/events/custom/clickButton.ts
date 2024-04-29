// Dependencies
const { Embed } = require('../../utils'),
	{ Collection, PermissionsBitField: { Flags: PermFlag } } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	cooldowns = new Collection(),
	Event = require('../../structures/Event');

/**
 * Click button event
 * @event Egglord#ClickButton
 * @extends {Event}
*/
class ClickButton extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {ButtonInteraction} button The button that was pressed
	 * @readonly
	*/
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
					return button.reply({ embeds: [channel.error('ticket/ticket-create:COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)], ephemeral: true });
				}
			}

			// Make sure ticket dosen't already exist
			if (guild.channels.cache.find(c => c.name == `ticket-${member.user.id}`)) {
				return button.reply({ embeds: [channel.error('ticket/ticket-create:TICKET_EXISTS', {}, true)], ephemeral: true });
			}

			// create perm array
			const perms = [
				{ id: member.user, allow: [PermFlag.SendMessages, PermFlag.ViewChannel] },
				{ id: guild.roles.everyone, deny: [PermFlag.SendMessages, PermFlag.ViewChannel] },
				{ id: bot.user, allow: [PermFlag.SendMessages, PermFlag.ViewChannel, PermFlag.EmbedLinks] },
			];
			if (guild.roles.cache.get(guild.settings.TicketSupportRole)) perms.push({ id: guild.settings.TicketSupportRole, allow: [PermFlag.SendMessages, PermFlag.ViewChannel] });

			// create channel
			try {
				const c = await guild.channels.create({ name: `ticket-${member.user.id}`, type: ChannelType.GuildText,
					reason: guild.translate('misc:NO_REASON'),
					parent: guild.settings.TicketCategory,
					permissionOverwrites: perms });

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
					.addFields(
						{ name: guild.translate('ticket/ticket-create:FIELD1', { USERNAME: member.user.displayName }), value: guild.translate('ticket/ticket-create:FIELDT') },
						{ name: guild.translate('ticket/ticket-create:FIELD2'), value: guild.translate('misc:NO_REASON') },
					)
					.setTimestamp();
				c.send({ content: `${member.user}${guild.roles.cache.get(guild.settings.TicketSupportRole) ? `, <@&${guild.settings.TicketSupportRole}>` : ''}.`, embeds: [embed] });

				// run ticketcreate event
				await bot.emit('ticketCreate', channel, embed);
			} catch (err) {
				console.log(err);
				bot.logger.error(`Command: '${this.conf.name}' has error: ${err.message}.`);
			}


			cooldowns.set(member.user.id, now);
			setTimeout(() => cooldowns.delete(member.user.id), cooldownAmount);
		}
	}
}

module.exports = ClickButton;
