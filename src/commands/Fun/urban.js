// Dependencies
const { define } = require('urban-dictionary'),
	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Urban command
 * @extends {Command}
*/
class Urban extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'urban',
			nsfw: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get the urban dictionary of a word.',
			usage: 'urban <word>',
			cooldown: 1000,
			examples: ['urban watermelon sugar', 'urban nice drip'],
			slash: true,
			options: [{
				name: 'phrase',
				description: 'Phrase to look up.',
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
		// Get phrase
		const phrase = message.args.join(' ');
		if (!phrase) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/urban:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Search up phrase in urban dictionary
		const resp = await this.fetchDefinition(bot, message.guild, phrase, message.channel);
		msg.delete();
		message.channel.send({ embeds: [resp] });
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
		const channel = guild.channels.cache.get(interaction.channelId),
			phrase = args.get('phrase').value;

		// display phrases' definition
		const resp = await this.fetchDefinition(bot, guild, phrase, channel);
		interaction.reply({ embeds: [resp] });
	}

	/**
	 * Function for fetching and creating definition embed.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {string} phrase The phrase to search
	 * @param {channel} channel The channel the command was ran in
	 * @returns {embed}
	*/
	async fetchDefinition(bot, guild, phrase, channel) {
		try {
			const resp = await define(phrase);

			// send definition of word
			return new Embed(bot, guild)
				.setTitle('fun/urban:TITLE', { WORD: phrase })
				.setURL(resp[0].permalink)
				.setThumbnail('https://i.imgur.com/VFXr0ID.jpg')
				.setDescription(guild.translate('fun/urban:DESC', { DEFINTION: resp[0].definition, EXAMPLES: resp[0].example }))
				.addField('👍', `${resp[0].thumbs_up}`, true)
				.addField('👎', `${resp[0].thumbs_down}`, true);
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return channel.error('fun/urban:INCORRECT_URBAN', { PHRASE: phrase }, true);
		}
	}
}

module.exports = Urban;
