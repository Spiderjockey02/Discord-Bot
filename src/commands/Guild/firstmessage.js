// Dependencies
const { Embed } = require('../../utils'),
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
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Gets the first message from the channel.',
			usage: 'firstmessage [channel]',
			cooldown: 2000,
			slash: true,
			options: [{
				name: 'channel',
				description: 'The specified channel to grab the first message of.',
				type: 'CHANNEL',
				required: true,
			}],
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// get channel
		const channel = message.getChannel();

		try {
			// get first message in channel
			const fMessage = await channel[0].messages.fetch({ after: 1, limit: 1 }).then(msg => msg.first());
			const embed = this.createEmbed(bot, message.guild, fMessage);

			// send embed
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(args.get('channel').value);

		try {
			// get first message in channel
			const fMessage = await channel.messages.fetch({ after: 1, limit: 1 }).then(msg => msg.first());
			const embed = this.createEmbed(bot, guild, fMessage);

			// send embed
			interaction.reply({ embeds: [embed] });
		} catch (err) {
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
			.setAuthor({ name: fMessage.author.tag, iconURL: fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }) })
			.setDescription(fMessage.content)
			.addField(bot.translate('guild/firstmessage:JUMP'), fMessage.url)
			.setFooter({ text: guild.translate('misc:ID', { ID: fMessage.id }) })
			.setTimestamp(fMessage.createdAt);
	}
}

module.exports = Firstmessage;
