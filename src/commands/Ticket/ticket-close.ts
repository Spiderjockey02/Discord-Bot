// Dependencies
const { PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Ticket close command
 * @extends {Command}
*/
class TicketClose extends Command {
	/**
 * @param {Client} client The instantiating client
 * @param {CommandData} data The data for the command
*/
	constructor(bot) {
		super(bot, {
			name: 'ticket-close',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['t-close'],
			userPermissions: [Flags.ManageChannels],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
			description: 'Closes the current ticket channel',
			usage: 'ticket-close',
			cooldown: 3000,
			slash: false,
			isSubCmd: true,
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
		// will close the current ticket channel
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(message.channel.name)) {
			try {
				if (message.member.roles.cache.get(settings.TicketSupportRole) || message.member.permissionsIn(message.channel).has(Flags.ManageChannels)) {
					// delete channel
					await message.channel.delete();
				} else {
					return message.channel.error('ticket/ticket-close:NOT_SUPPORT');
				}
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else {
			message.channel.error('ticket/ticket-close:NOT_TICKET');
		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction, { settings }) {
		const channel = interaction.guild.channels.cache.get(interaction.channelId);

		// will close the current ticket channel
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(channel.name)) {
			try {
				if (interaction.member.roles.cache.get(settings.TicketSupportRole) || interaction.member.permissionsIn(channel).has(Flags.ManageChannels)) {
					// delete channel
					await interaction.channel.delete();
				} else {
					interaction.reply({ embeds: [channel.error('ticket/ticket-close:NOT_SUPPORT', {}, true)] });
				}
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
			}
		} else {
			interaction.reply({ embeds: [channel.error('ticket/ticket-close:NOT_TICKET', { }, true)], ephemeral: true });
		}
	}
}

module.exports = TicketClose;
