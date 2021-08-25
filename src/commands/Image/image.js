// Dependencies
const { image_search } = require('duckduckgo-images-api'),
	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Image command
 * @extends {Command}
*/
class Image extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'image',
			dirname: __dirname,
			aliases: ['img'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Finds an image based on the topic.',
			usage: 'image <topic>',
			cooldown: 2000,
			examples: ['image food'],
			slash: true,
			options: [{
				name: 'topic',
				description: 'Topic for image search',
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
		// Make sure a topic was included
		if (!message.args[0]) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/image:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '' }));

		// get results (image links etc)
		try {
			const results = await image_search({ query: message.args.join(' '), moderate: (message.channel.nsfw || message.channel.type == 'dm') ? false : true, iterations: 2, retries: 2 });

			// send image
			const embed = new Embed(bot, message.guild)
				.setImage(results[Math.floor(Math.random() * results.length)].image);
			message.channel.send({ embeds: [embed] });
		} catch (err) {
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
		const topic = args.get('topic').value;
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', {
			EMOJI: bot.customEmojis['loading'] }) });

		try {
			const results = await image_search({ query: topic, moderate: (channel.nsfw || channel.type == 'dm') ? false : true, iterations: 2, retries: 2 });
			const embed = new Embed(bot, guild)
				.setImage(results[Math.floor(Math.random() * results.length)].image);
			interaction.editReply({ content: ' ', embeds: [embed] });
		} catch(err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = Image;
