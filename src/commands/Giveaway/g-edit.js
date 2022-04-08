// Dependencies
const { time: { getTotalTime } } = require('../../utils'),
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
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Edit a giveaway.',
			usage: 'g-edit <messageID> <AddedTime> <newWinnerCount> <NewPrize>',
			cooldown: 2000,
			examples: ['g-edit 818821436255895612 2m 2 nitro', 'g-edit 818821436255895612 3h40m 5 nitro classic'],
			slash: true,
			options: [
				{
					name: 'id',
					description: 'Message ID of the giveaway.',
					type: 'NUMBER',
					required: true,
				},
				{
					name: 'time',
					description: 'Extra time added to the giveaway.',
					type: 'NUMBER',
					required: false,
				},
				{
					name: 'winners',
					description: 'New winner count.',
					type: 'NUMBER',
					minValue: 1,
					maxValue: 10,
					required: false,
				},
				{
					name: 'prize',
					description: 'New prize',
					type: 'NUMBER',
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
		if (message.args.length <= 3) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-edit:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Get new Time
		const time = getTotalTime(message.args[1], message);
		if (!time) return;

		// Get new winner count
		if (isNaN(message.args[2])) return message.channel.error('giveaway/g-edit:INCORRECT_WINNER_COUNT').then(m => m.timedDelete({ timeout: 5000 }));

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
		const id = args.get('id').value,
			time = args.get('time')?.value,
			winners = args.get('winners')?.value,
			prize = args.get('prize')?.value;

		// Update giveaway
		try {
			await bot.giveawaysManager.edit(id, {
				newWinnerCount: winners,
				newPrize: prize,
				addTime: time,
			});
			interaction.reply(bot.translate('giveaway/g-edit:EDIT_GIVEAWAY', { TIME: bot.giveawaysManager.options.updateCountdownEvery / 1000 }));
		} catch (err) {
			bot.logger.error(`Command: 'g-edit' has error: ${err}.`);
			interaction.reply(bot.translate('giveaway/g-edit:UNKNOWN_GIVEAWAY', { ID: id }));
		}
	}
}

module.exports = GiveawayEdit;
