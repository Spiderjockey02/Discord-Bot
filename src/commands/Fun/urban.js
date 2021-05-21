// Dependencies
const { define } = require('urban-dictionary'),
	{ MessageEmbed } = require('discord.js'),
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
			return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(`${message.checkEmoji() ? bot.customEmojis['loading'] : ''} Fetching ${this.help.name}...`);

		// Search up phrase in urban dictionary
		define(`${phrase}`, (err, entries) => {
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				msg.delete();
				return message.channel.error(settings.Language, 'FUN/INCORRECT_URBAN', phrase).then(m => setTimeout(() => { m.delete(); }, 5000));
			}

			// send definition of word
			const embed = new MessageEmbed()
				.setTitle(bot.translate(settings.Language, 'FUN/URBAN_TITLE', phrase))
				.setURL(entries[0].permalink)
				.setThumbnail('https://i.imgur.com/VFXr0ID.jpg')
				.setDescription(bot.translate(settings.Language, 'FUN/URBAN_DESCRIPTION', [`${entries[0].definition}`, `${entries[0].example}`]))
				.addField('👍', entries[0].thumbs_up, true)
				.addField('👎', entries[0].thumbs_down, true);
			message.channel.send(embed);
			msg.delete();
		});
	}
};
