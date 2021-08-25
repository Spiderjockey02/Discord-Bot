// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
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
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a fake Clyde message.',
			usage: 'clyde <text>',
			cooldown: 5000,
			examples: ['clyde Hello I\'m a bot'],
			slash: true,
			options: [{
				name: 'text',
				description: 'Phrase to use',
				type: 'STRING',
				required: true,
			}],
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Get text
		const text = message.args.join(' ');

		// make sure text was entered
		if (!text) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/clyde:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// make sure the text isn't longer than 70 characters
		if (text.length >= 71) return message.channel.error('image/clyde:TOO_LONG').then(m => m.timedDelete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '' }));

		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=clyde&text=${text}`)).then(res => res.json());

			// send image
			const embed = new Embed(bot, message.guild)
				.setColor(3447003)
				.setImage(json.message);
			message.channel.send({ embeds: [embed] });
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
		msg.delete();
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
		const text = args.get('text').value;
		const channel = guild.channels.cache.get(interaction.channelId);

		// make sure the text isn't longer than 80 characters
		if (text.length >= 71) return interaction.reply({ embeds: [channel.error('image/clyde:TOO_LONG', {}, true)], ephemeral: true });

		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', {
			EMOJI: bot.customEmojis['loading'] }) });
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=clyde&text=${text}`)).then(res => res.json());
			const embed = new Embed(bot, guild)
				.setColor(3447003)
				.setImage(json.message);
			interaction.editReply({ content: ' ', embeds: [embed] });
		} catch(err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = Clyde;
