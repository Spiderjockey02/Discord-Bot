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
	async run(bot, message, args, settings) {
		// Get phrase
		const phrase = args.join(' ');
		if (!phrase) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}

		// Search up phrase in urban dictionary
		define(`${phrase}`, (err, entries) => {
			if (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.error(settings.Language, 'FUN/INCORRECT_URBAN', phrase).then(m => m.delete({ timeout: 5000 }));
			} else {
				// send message
				const embed = new MessageEmbed()
					.setTitle(message.translate(settings.Language, 'FUN/URBAN_TITLE', phrase))
					.setURL(entries[0].permalink)
					.setThumbnail('https://i.imgur.com/VFXr0ID.jpg')
					.setDescription(message.translate(settings.Language, 'FUN/URBAN_DESCRIPTION', [`${entries[0].definition}`, `${entries[0].example}`]))
					.addField('👍', entries[0].thumbs_up, true)
					.addField('👎', entries[0].thumbs_down, true);
				message.channel.send(embed);
			}
		});
	}
};
