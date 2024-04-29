// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, IntentsBitField, PermissionsBitField: { Flags } } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	Command = require('../../structures/Command.js');

/**
 * Firstmessage command
 * @extends {Command}
*/
class Firstmessage extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'firstmessage',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['firstmsg', 'first-msg'],
			description: 'Gets the first message from the channel.',
			usage: 'firstmessage [channel]',
			cooldown: 2000,
			slash: true,
			options: [{
				name: 'channel',
				description: 'The specified channel to grab the first message of.',
				type: ApplicationCommandOptionType.Channel,
				channelTypes: [ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread, ChannelType.GuildNews],
				required: false,
			}],
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// get channel
		const channel = message.getChannel();

		// Make sure channel is a text-based channel with permission to read messages
		if (channel[0].isTextBased() || channel[0].permissionsFor(bot.user).has(Flags.ViewChannel)) return message.channel.error('misc:MISSING_CHANNEL');
		if (!channel[0].permissionsFor(bot.user).has(Flags.ReadMessageHistory)) return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: channel.guild.translate('permissions:ReadMessageHistory') });

		try {
			// get first message in channel
			const fMessage = await channel[0].messages.fetch({ after: 1, limit: 1 }).then(msg => msg.first());
			const embed = this.createEmbed(bot, message.guild, fMessage);

			// send embed
			message.channel.send({ embeds: [embed] });
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
		// Check permission of channel
		const channel = guild.channels.cache.get(args.get('channel')?.value ?? interaction.channelId);
		if (!channel.permissionsFor(bot.user).has(Flags.ReadMessageHistory)) return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: channel.guild.translate('permissions:ReadMessageHistory') }, true)], ephemeral: true });

		try {
			// get first message in channel
			const fMessage = await channel.messages.fetch({ after: 1, limit: 1 }).then(msg => msg.first());
			const embed = this.createEmbed(bot, guild, fMessage);

			// send embed
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			console.log(err);
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	/**
	 * Function for creating first message embed.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command ran in
	 * @param {fMessage} Message The first message of the channel
	 * @returns {embed}
	*/
	createEmbed(bot, guild, fMessage) {
		return new Embed(bot, guild)
			.setColor(fMessage.member ? fMessage.member.displayHexColor : 0x00AE86)
			.setThumbnail(fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }))
			.setAuthor({ name: fMessage.author.displayName, iconURL: fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }) })
			.setDescription(bot.options.intents.has(IntentsBitField.Flags.MessageContent) ? fMessage.content : 'Unable to fetch message content.')
			.addFields(
				{ name: bot.translate('guild/firstmessage:JUMP'), value: fMessage.url },
			)
			.setFooter({ text: guild.translate('misc:ID', { ID: fMessage.id }) })
			.setTimestamp(fMessage.createdAt);
	}
}

module.exports = Firstmessage;
