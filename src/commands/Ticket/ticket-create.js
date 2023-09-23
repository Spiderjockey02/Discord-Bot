// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	Command = require('../../structures/Command.js');

/**
 * Ticket create command
 * @extends {Command}
*/
class TicketCreate extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'ticket-create',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['t-create', 't-open'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
			description: 'Creates a ticket',
			usage: 'ticket-create [reason]',
			cooldown: 3000,
			examples: ['t-create Something isn\'t working'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'reason',
					description: 'Reason for creating ticket.',
					type: ApplicationCommandOptionType.String,
					maxLength: 2000,
					required: false,
				},
			],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Check if a ticket channel is already open
		if (message.guild.channels.cache.find(channel => channel.name == `ticket-${message.author.id}`)) {
			return message.channel.error('ticket/ticket-create:TICKET_EXISTS');
		}

		// get reason
		const reason = (message.args[0]) ? message.args.join(' ') : message.translate('misc:NO_REASON');

		// create perm array
		const perms = [
			{ id: message.author, allow: [Flags.SendMessages, Flags.ViewChannel] },
			{ id: message.guild.roles.everyone, deny: [Flags.SendMessages, Flags.ViewChannel] },
			{ id: bot.user, allow: [Flags.SendMessages, Flags.ViewChannel, Flags.EmbedLinks] },
		];
		if (message.guild.roles.cache.get(settings.TicketSupportRole)) perms.push({ id: settings.TicketSupportRole, allow: [Flags.SendMessages, Flags.ViewChannel] });

		// create channel
		try {
			const channel = await message.guild.channels.create({ name: `ticket-${message.author.id}`,
				type: ChannelType.GuildText,
				reason: reason,
				parent: settings.TicketCategory,
				permissionOverwrites: perms,
			});

			// reply to user saying that channel has been created
			const successEmbed = new Embed(bot, message.guild)
				.setTitle('ticket/ticket-create:TITLE')
				.setDescription(message.translate('ticket/ticket-create:DESC', { CHANNEL: channel.id }));
			message.channel.send({ embeds: [successEmbed] }).then(m => m.timedDelete({ timeout:10000 }));

			// Add message to ticket channel
			const embed = new Embed(bot, message.guild)
				.setColor(0xFF5555)
				.addFields(
					{ name: message.translate('ticket/ticket-create:FIELD1', { USERNAME: message.author.displayName }), value: message.translate('ticket/ticket-create:FIELDT') },
					{ name: message.translate('ticket/ticket-create:FIELD2'), value: reason },
				)
				.setTimestamp();
			channel.send({ content: `${message.author}${message.guild.roles.cache.get(settings.TicketSupportRole) ? `, <@&${settings.TicketSupportRole}>` : ''}.`, embeds: [embed] });

			// run ticketcreate event
			bot.emit('ticketCreate', channel, embed);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const reason = args.get('reason')?.value ?? guild.translate('misc:NO_REASON'),
			{ settings } = guild;
		let channel = guild.channels.cache.get(interaction.channelId);

		// Check if a ticket channel is already open
		if (guild.channels.cache.find(c => c.name == `ticket-${interaction.user.id}`)) {
			return interaction.reply({ embeds: [channel.error('ticket/ticket-create:TICKET_EXISTS', {}, true)], ephermal: true });
		}

		// create perm array
		const perms = [
			{ id: interaction.user, allow: [Flags.SendMessages, Flags.ViewChannel] },
			{ id: guild.roles.everyone, deny: [Flags.SendMessages, Flags.ViewChannel] },
			{ id: bot.user, allow: [Flags.SendMessages, Flags.ViewChannel, Flags.EmbedLinks] },
		];
		if (guild.roles.cache.get(settings.TicketSupportRole)) perms.push({ id: settings.TicketSupportRole, allow: [Flags.SendMessages, Flags.ViewChannel] });

		// create channel
		try {
			channel = await guild.channels.create({ name: `ticket-${interaction.user.id}`,
				type: ChannelType.GuildText,
				reason: reason,
				parent: settings.TicketCategory,
				permissionOverwrites: perms,
			});

			// reply to user saying that channel has been created
			const successEmbed = new Embed(bot, guild)
				.setTitle('ticket/ticket-create:TITLE')
				.setDescription(guild.translate('ticket/ticket-create:DESC', { CHANNEL: channel.id }));
			interaction.reply({ embeds: [successEmbed], ephermal: true });

			// Add message to ticket channel
			const embed = new Embed(bot, guild)
				.setColor(0xFF5555)
				.addFields(
					{ name: guild.translate('ticket/ticket-create:FIELD1', { USERNAME: interaction.user.displayName }), value: guild.translate('ticket/ticket-create:FIELDT') },
					{ name: guild.translate('ticket/ticket-create:FIELD2'), value: reason },
				)
				.setTimestamp();
			channel.send({ content: `${interaction.user}${guild.roles.cache.get(settings.TicketSupportRole) ? `, <@&${settings.TicketSupportRole}>` : ''}.`, embeds: [embed] });

			// run ticketcreate event
			bot.emit('ticketCreate', channel, embed);
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = TicketCreate;
