// Dependencies
const { Embed } = require('../../utils'),
	{ AttachmentBuilder, ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Clyde command
 * @extends {Command}
*/
class Clyde extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'clyde',
			dirname: __dirname,
			description: 'Create a fake Clyde message.',
			usage: 'clyde <text>',
			cooldown: 5000,
			examples: ['clyde Hello I\'m a bot'],
			slash: true,
			options: [{
				name: 'text',
				description: 'Phrase to use',
				type: ApplicationCommandOptionType.String,
				maxLength: 71,
				required: true,
			}],
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
		// Get text
		const text = message.args.join(' ');

		// make sure text was entered
		if (!text) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/clyde:USAGE')) });

		// make sure the text isn't longer than 70 characters
		if (text.length >= 71) return message.channel.error('image/clyde:TOO_LONG');

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '' }));

		try {
			const resp = await bot.fetch('image/clyde', { text });

			const attachment = new AttachmentBuilder(Buffer.from(resp, 'base64'), { name: 'clyde.png' });
			const embed = new Embed(bot, message.guild)
				.setImage('attachment://clyde.png');
			message.channel.send({ embeds: [embed], files: [attachment] });
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
		msg.delete();
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
		const text = args.get('text').value;
		const channel = guild.channels.cache.get(interaction.channelId);

		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', {
			EMOJI: bot.customEmojis['loading'] }) });
		try {
			const resp = await bot.fetch('image/clyde', { text });

			// Check if an object was sent instead (probs an error)
			const isObject = typeof resp.toString() == 'object';
			if (isObject) {
				const possibleError = JSON.parse(resp.toString())?.error;
				if (possibleError) throw new Error(possibleError);
			}

			const attachment = new AttachmentBuilder(Buffer.from(resp, 'base64'), { name: 'clyde.png' });
			const embed = new Embed(bot, guild)
				.setImage('attachment://clyde.png');
			interaction.editReply({ content: ' ', embeds: [embed], files: [attachment] });
		} catch(err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = Clyde;
