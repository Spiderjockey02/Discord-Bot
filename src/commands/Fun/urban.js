// Dependencies
const { define } = require('urban-dictionary'),
	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Urban extends Command {
	constructor(bot) {
		super(bot, {
			name: 'urban',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get the urban dictionary of a word.',
			usage: 'urban <word>',
			cooldown: 1000,
			examples: ['urban watermelon sugar', 'urban nice drip'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get phrase
		const phrase = message.args.join(' ');
		if (!phrase) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/urban:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Search up phrase in urban dictionary
		define(`${phrase}`, (err, entries) => {
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				msg.delete();
				return message.channel.error('fun/urban:INCORRECT_URBAN', { PHRASE: phrase }).then(m => m.delete({ timeout: 5000 }));
			}

			// send definition of word
			const embed = new Embed(bot, message.guild)
				.setTitle('fun/urban:TITLE', { WORD: phrase })
				.setURL(entries[0].permalink)
				.setThumbnail('https://i.imgur.com/VFXr0ID.jpg')
				.setDescription(message.translate('fun/urban:DESCRIPTION', { DEFINTION: entries[0].definition, EXAMPLES: entries[0].example }))
				.addField('👍', entries[0].thumbs_up, true)
				.addField('👎', entries[0].thumbs_down, true);
			message.channel.send(embed);
			msg.delete();
		});
	}
};
