// Dependencies
const { term } = require('urban-dictionary');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Get phrase
	const phrase = args.join(' ');
	if (!phrase) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('urban').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	// Search up phrase in urban dictionary
	term(`${phrase}`, (err, entries) => {
		if (err) {
			if (bot.config.debug) bot.logger.error(`${err.message} - command: urban.`);
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
};

module.exports.config = {
	command: 'urban',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Urban',
	category: 'Fun',
	description: 'Get the urban dictionary of a word.',
	usage: '${PREFIX}urban <word>',
	example: '${PREFIX}urban watermelon sugar',
};
