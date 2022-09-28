// Dependencies
const { get } = require('axios'),
	{ Embed } = require('../../utils'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Gonewild command
 * @extends {Command}
*/
class Gonewild extends Command {
	/*
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'gonewild',
			nsfw: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Look at NSFW images.',
			usage: 'gonewild',
			cooldown: 2000,
			slash: true,
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('nsfw/4k:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		try {
			get('https://nekobot.xyz/api/image?type=gonewild')
				.then(res => {
					msg.delete();
					const embed = new Embed(bot, message.guild)
						.setImage(res.data.message);
					message.channel.send({ embeds: [embed] });
				});
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({ content: guild.translate('misc:FETCHING', {	EMOJI: bot.customEmojis['loading'], ITEM: 'Image' }) });

		try {
			get('https://nekobot.xyz/api/image?type=gonewild')
				.then(res => {
					const embed = new Embed(bot, guild)
						.setImage(res.data.message);
					interaction.editReply({ content: ' ', embeds: [embed], ephemeral: true });
				});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = Gonewild;
