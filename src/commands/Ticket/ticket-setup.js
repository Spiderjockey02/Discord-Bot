// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	Command = require('../../structures/Command.js');

/**
 * Ticket setup command
 * @extends {Command}
*/
class TicketSetup extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'ticket-setup',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['t-setup', 'ticket-setup'],
			userPermissions: [Flags.ManageChannels],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
			description: 'Setups the ticket plugin',
			usage: 'ticket-setup',
			cooldown: 3000,
			examples: ['t-setup category 783024613037703237', 't-setup role 766029837017153576'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'option',
					description: 'option',
					type: ApplicationCommandOptionType.String,
					choices: [...['category', 'role'].map(i => ({ name: i, value: i }))],
					required: true,
				},
				{
					name: 'id',
					description: 'id of role or category',
					type: ApplicationCommandOptionType.Integer,
					require: true,
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
		// will setup the ticket command
		if (!message.args[0]) {
			const embed = new Embed(bot, message.guild)
				.setTitle('ticket/ticket-setup:TITLE')
				.setDescription(`\`${settings.prefix}ticket-setup category <channelID>\` - The parent of the channels \n\`${settings.prefix}ticket-setup role <roleID>\` - The support role for accessing channels`);
			message.channel.send({ embeds: [embed] });
		} else if (message.args[0] == 'category') {

			// update category channel
			try {
				const channel = message.guild.channels.cache.get(message.args[1]);
				if (!channel || channel.type != ChannelType.GuildCategory) return message.channel.error('ticket/ticket-setup:NOT_CATEGORY');
				// update database
				await message.guild.updateGuild({ TicketCategory: message.args[1] });
				message.channel.send(message.translate('ticket/ticket-setup:UPDATED_CATEGORY', { NAME: channel.name }));
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else if (message.args[0] == 'role') {

			// update support role
			try {
				const supportRole = message.guild.roles.cache.get(message.args[1]);
				if (!supportRole) return message.channel.error('ticket/ticket-setup:NOT_ROLE');
				// update database
				await message.guild.updateGuild({ TicketSupportRole: message.args[1] });
				message.channel.success(message.translate('ticket/ticket-setup:UPDATED_ROLE').replace('{ROLE}', supportRole));
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
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
		const option = args.get('option').value,
			id = args.get('id').value;
		let channel = guild.channels.cache.get(interaction.channelId);

		switch (option) {
			case 'category':
			// update category channel
				try {
					channel = guild.channels.cache.get(id);
					if (!channel || channel.type != 'GUILD_CATEGORY') return interaction.reply({ content: guild.translate('ticket/ticket-setup:NOT_CATEGORY') });

					// update database
					await guild.updateGuild({ TicketCategory: id });
					interaction.reply({ content: guild.translate('ticket/ticket-setup:UPDATED_CATEGORY', { NAME: channel.name }) });
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
				}
				break;
			case 'role':
			// update support role
				try {
					const supportRole = guild.roles.cache.get(id);
					if (!supportRole) return interaction.reply({ content:guild.translate('ticket/ticket-setup:NOT_ROLE') });

					// update database
					await guild.updateGuild({ TicketSupportRole: id });
					interaction.reply({ content: guild.translate('ticket/ticket-setup:UPDATED_ROLE').replace('{ROLE}', supportRole) });
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
				}
				break;
		}
	}
}

module.exports = TicketSetup;
