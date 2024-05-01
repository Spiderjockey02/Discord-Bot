// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, IntentsBitField, PermissionsBitField: { Flags } } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'), ;
import Command from '../../structures/Command';

/**
 * Firstmessage command
 * @extends {Command}
*/
export default class Firstmessage extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor() {
		super({
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
	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(client, message) {
		// get channel
		const channel = message.getChannel();

		// Make sure channel is a text-based channel with permission to read messages
		if (channel[0].isTextBased() || channel[0].permissionsFor(client.user).has(Flags.ViewChannel)) return message.channel.error('misc:MISSING_CHANNEL');
		if (!channel[0].permissionsFor(client.user).has(Flags.ReadMessageHistory)) return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: channel.guild.translate('permissions:ReadMessageHistory') });

		try {
			// get first message in channel
			const fMessage = await channel[0].messages.fetch({ after: 1, limit: 1 }).then(msg => msg.first());
			const embed = this.createEmbed(client, message.guild, fMessage);

			// send embed
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		// Check permission of channel
		const channel = guild.channels.cache.get(args.get('channel')?.value ?? interaction.channelId);
		if (!channel.permissionsFor(client.user).has(Flags.ReadMessageHistory)) return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: channel.guild.translate('permissions:ReadMessageHistory') }, true)], ephemeral: true });

		try {
			// get first message in channel
			const fMessage = await channel.messages.fetch({ after: 1, limit: 1 }).then(msg => msg.first());
			const embed = this.createEmbed(client, guild, fMessage);

			// send embed
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			console.log(err);
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	/**
	 * Function for creating first message embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command ran in
	 * @param {fMessage} Message The first message of the channel
	 * @returns {embed}
	*/
	createEmbed(client, guild, fMessage) {
		return new Embed(client, guild)
			.setColor(fMessage.member ? fMessage.member.displayHexColor : 0x00AE86)
			.setThumbnail(fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }))
			.setAuthor({ name: fMessage.author.displayName, iconURL: fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }) })
			.setDescription(client.options.intents.has(IntentsBitField.Flags.MessageContent) ? fMessage.content : 'Unable to fetch message content.')
			.addFields(
				{ name: client.translate('guild/firstmessage:JUMP'), value: fMessage.url },
			)
			.setFooter({ text: guild.translate('misc:ID', { ID: fMessage.id }) })
			.setTimestamp(fMessage.createdAt);
	}
}

