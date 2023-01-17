// Dependencies
const { time: { getTotalTime } } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Giveaway edit command
 * @extends {Command}
*/
class GiveawayEdit extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'g-edit',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['giveaway-edit', 'gedit'],
			userPermissions: [Flags.ManageGuild],
			description: 'Edit a giveaway.',
			usage: 'g-edit <messageID> <AddedTime> <newWinnerCount> <NewPrize>',
			cooldown: 2000,
			examples: ['g-edit 818821436255895612 2m 2 nitro', 'g-edit 818821436255895612 3h40m 5 nitro classic'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'id',
					description: 'Message ID of the giveaway.',
					type: ApplicationCommandOptionType.Integer,
					required: true,
				},
				{
					name: 'time',
					description: 'Extra time added to the giveaway.',
					type: ApplicationCommandOptionType.Integer,
					required: false,
				},
				{
					name: 'winners',
					description: 'New winner count.',
					type: ApplicationCommandOptionType.Integer,
					minValue: 1,
					maxValue: 10,
					required: false,
				},
				{
					name: 'prize',
					description: 'New prize',
					type: ApplicationCommandOptionType.String,
					maxLength: 256,
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
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Make sure the message ID of the giveaway embed is entered
		if (message.args.length <= 3) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-edit:USAGE')) });

		// Get new Time
		const { error, success: time } = getTotalTime(message.args[0]);
		if (error) return message.channel.error(error);

		// Get new winner count
		if (isNaN(message.args[2])) return message.channel.error('giveaway/g-edit:INCORRECT_WINNER_COUNT');

		// Update giveaway
		try {
			await bot.giveawaysManager.edit(message.args[0], {
				newWinnerCount: parseInt(message.args[2]),
				newPrize: message.args.slice(3).join(' '),
				addTime: time,
			});
			message.channel.send(bot.translate('giveaway/g-edit:EDIT_GIVEAWAY', { TIME: bot.giveawaysManager.options.updateCountdownEvery / 1000 }));
		} catch (err) {
			bot.logger.error(`Command: 'g-edit' has error: ${err}.`);
			message.channel.send(bot.translate('giveaway/g-edit:UNKNOWN_GIVEAWAY', { ID: message.args[0] }));
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
			id = args.get('id').value,
			winners = args.get('winners')?.value,
			prize = args.get('prize')?.value;

		// Make sure a time, winner or prize was inputted or no point editing the file.
		if (!time && !winners && !prize) return interaction.reply({ embeds: [channel.error('giveaway/g-edit:NOTHING_TO_EDIT')], ephemeral: true });

		const { error, success: time } = getTotalTime(args.get('time').value ?? 0);
		if (error) return interaction.reply({ embeds: [channel.error(error, null, true)], ephemeral: true });

		// Update giveaway
		try {
			await bot.giveawaysManager.edit(id, {
				newWinnerCount: winners ?? bot.giveawaysManager.giveaways.find(g => g.messageID == id).winnerCount,
				newPrize: prize ?? bot.giveawaysManager.giveaways.find(g => g.messageID == id).prize,
				addTime: time,
			});
			interaction.reply({ embeds: [channel.success('giveaway/g-edit:EDIT_GIVEAWAY', { TIME: bot.giveawaysManager.options.updateCountdownEvery / 1000 }, true)] });
		} catch (err) {
			bot.logger.error(`Command: 'g-edit' has error: ${err}.`);
			interaction.reply({ content: bot.translate('giveaway/g-edit:UNKNOWN_GIVEAWAY', { ID: id }), ephemeral: true });
		}
	}
}

module.exports = GiveawayEdit;
