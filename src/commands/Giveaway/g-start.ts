// Dependencies
const { time: { getTotalTime } } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	Command = require('../../structures/Command.js');

/**
 * Giveaway start command
 * @extends {Command}
*/
class GiveawayStart extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'g-start',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['gstart', 'g-create'],
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
			description: 'Start a giveaway',
			usage: 'g-start <time> <Number of winners> <prize>',
			cooldown: 30000,
			examples: ['g-start 1m 1 nitro', 'g-start 2h30m 3 nitro classic'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'time',
					description: 'Extra time added to the giveaway.',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
				{
					name: 'winners',
					description: 'New winner count.',
					type: ApplicationCommandOptionType.Integer,
					minValue: 1,
					maxValue: 10,
					required: true,
				},
				{
					name: 'prize',
					description: 'New prize',
					type: ApplicationCommandOptionType.String,
					maxLength: 256,
					required: true,
				},
				{
					name: 'channel',
					description: 'Channel to post the giveaway in.',
					type: ApplicationCommandOptionType.Channel,
					channelTypes: [ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread, ChannelType.GuildNews],
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

		// Make sure a time, winner count & prize is entered
		if (message.args.length <= 2) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-start:USAGE')) });

		// Get time
		const { error, success: time } = getTotalTime(message.args[0]);
		if (error) return message.channel.error(error);

		// Make sure that number of winners is a number
		if (isNaN(message.args[1]) || message.args[1] > 10) return message.channel.error('giveaway/g-edit:INCORRECT_WINNER_COUNT');

		// Make sure prize is less than 256 characters
		if (message.args.slice(2).join(' ').length >= 256) return message.channel.error('giveaway/g-start:PRIZE_TOO_LONG');

		// Start the giveaway
		try {
			await bot.giveawaysManager.start(message.channel, {
				duration: time,
				prize: message.args.slice(2).join(' '),
				winnerCount: parseInt(message.args[1]),
				hostedBy: message.member,
				messages: {
					giveaway: message.translate('giveaway/g-start:TITLE'),
					giveawayEnded: message.translate('giveaway/g-start:ENDED'),
					timeRemaining: message.translate('giveaway/g-start:TIME_REMAINING'),
					inviteToParticipate: message.translate('giveaway/g-start:INVITE_PARTICIPATE'),
					winMessage: message.translate('giveaway/g-start:WIN_MESSAGE'),
					embedFooter: message.translate('giveaway/g-start:FOOTER'),
					noWinner: message.translate('giveaway/g-start:NO_WINNER'),
					winners: message.translate('giveaway/g-start:WINNERS'),
					endedAt: message.translate('giveaway/g-start:END_AT'),
					hostedBy: message.translate('giveaway/g-start:HOSTED'),
					drawing: 'Drawing: {timestamp}',
					units: {
						seconds: message.translate('time:SECONDS', { amount: '' }).trim(),
						minutes: message.translate('time:MINUTES', { amount: '' }).trim(),
						hours: message.translate('time:HOURS', { amount: '' }).trim(),
						days: message.translate('time:DAYS', { amount: '' }).trim(),
					},
				},
			});
			bot.logger.log(`${message.author.displayName} started a giveaway in server: [${message.guild.id}].`);
		} catch (err) {
			bot.logger.error(`Command: 'g-start' has error: ${err}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err });
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
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(args.get('channel')?.value ?? interaction.channelId),
			winners = args.get('winners').value,
			prize = args.get('prize').value;

		// Get time
		const { error, success: time } = getTotalTime(args.get('time').value);
		if (error) return interaction.reply({ embeds: [channel.error(error, null, true)] });

		// Start the giveaway
		try {
			await bot.giveawaysManager.start(channel, {
				duration: time,
				prize: prize,
				winnerCount: winners,
				hostedBy: member,
				messages: {
					giveaway: guild.translate('giveaway/g-start:TITLE'),
					giveawayEnded: guild.translate('giveaway/g-start:ENDED'),
					timeRemaining: guild.translate('giveaway/g-start:TIME_REMAINING'),
					inviteToParticipate: guild.translate('giveaway/g-start:INVITE_PARTICIPATE'),
					winMessage: guild.translate('giveaway/g-start:WIN_MESSAGE'),
					embedFooter: guild.translate('giveaway/g-start:FOOTER'),
					noWinner: guild.translate('giveaway/g-start:NO_WINNER'),
					winners: guild.translate('giveaway/g-start:WINNERS'),
					endedAt: guild.translate('giveaway/g-start:END_AT'),
					hostedBy: guild.translate('giveaway/g-start:HOSTED'),
					drawing: 'Drawing: {timestamp}',
					units: {
						seconds: guild.translate('time:SECONDS', { amount: '' }).trim(),
						minutes: guild.translate('time:MINUTES', { amount: '' }).trim(),
						hours: guild.translate('time:HOURS', { amount: '' }).trim(),
						days: guild.translate('time:DAYS', { amount: '' }).trim(),
					},
				},
			});
			bot.logger.log(`${member.user.displayName} started a giveaway in server: [${guild.id}].`);
			interaction.reply({ content: 'Succesfully started giveaway' });
		} catch (err) {
			bot.logger.error(`Command: 'g-start' has error: ${err}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

}

module.exports = GiveawayStart;
