// Dependencies
const	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Giveaway delete command
 * @extends {Command}
*/
class GiveawayDelete extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'g-delete',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['giveaway-delete', 'gdelete'],
			userPermissions: [Flags.ManageGuild],
			description: 'Delete a giveaway',
			usage: 'g-delete <messageID>',
			cooldown: 2000,
			examples: ['g-delete 818821436255895612'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'id',
					description: 'Message ID of the giveaway.',
					type: ApplicationCommandOptionType.Integer,
					required: true,
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
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Make sure the message ID of the giveaway embed is entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-delete:USAGE')) });

		// Delete the giveaway
		const messageID = message.args[0];
		try {
			await bot.giveawaysManager.delete(messageID);
			message.channel.send(bot.translate('giveaway/g-delete:SUCCESS_GIVEAWAY'));
		} catch (err) {
			bot.logger.error(`Command: 'g-delete' has error: ${err}.`);
			message.channel.send(bot.translate('giveaway/g-delete:UNKNOWN_GIVEAWAY', { ID: messageID }));
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
		const channel = guild.channels.cache.get(interaction.channelId),
			messageID = args.get('messageID').value;

		// Delete the giveaway
		try {
			await bot.giveawaysManager.delete(messageID);
			interaction.reply({ embeds: [channel.success('giveaway/g-delete:SUCCESS_GIVEAWAY', {}, true)] });
		} catch (err) {
			bot.logger.error(`Command: 'g-delete' has error: ${err}.`);
			interaction.reply({ content: bot.translate('giveaway/g-delete:UNKNOWN_GIVEAWAY', { ID: messageID }), ephemeral: true });
		}
	}
}

module.exports = GiveawayDelete;
