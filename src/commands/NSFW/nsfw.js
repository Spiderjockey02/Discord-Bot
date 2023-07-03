// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * 4k command
 * @extends {Command}
*/
class NSFW extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'nsfw',
			nsfw: true,
			dirname: __dirname,
			description: 'Look at NSFW images.',
			usage: '4k',
			cooldown: 2000,
			slash: true,
			options: [{
				name: 'type',
				description: 'Type of image',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: ['hentai', 'ass', 'pgif', 'thigh', 'hass', 'boobs', 'hboobs', 'lewdneko', 'feet', 'hyuri', 'hthigh', 'anal', 'blowjob', 'gonewild', '4k', 'kanna', 'hentai_anal', 'neko'].map(i => ({ name: i, value: i })),
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
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('nsfw/4k:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		try {
			const image = await bot.fetch('nsfw/image', { type: message.args[0] });
			msg.delete();
			const embed = new Embed(bot, message.guild)
				.setImage(image);
			message.channel.send({ embeds: [embed] });
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
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({ content: guild.translate('misc:FETCHING', {	EMOJI: bot.customEmojis['loading'], ITEM: 'Image' }) });

		try {
			const image = await bot.fetch('nsfw/image', { type: args.get('type').value });
			if (image.error) throw new Error(image.error);

			const embed = new Embed(bot, guild)
				.setImage(image);
			interaction.editReply({ content: ' ', embeds: [embed], ephemeral: true });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = NSFW;
