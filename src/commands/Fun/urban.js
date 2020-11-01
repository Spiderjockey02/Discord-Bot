// Dependencies
const ud = require('urban-dictionary');
const Discord = require('discord.js');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Get phrase
	const phrase = args.join(' ');
	if (!phrase) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('urban').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Search up phrase in urban dictionary
	ud.term(`${phrase}`, (err, entries) => {
		if (err) {
			if (bot.config.debug) bot.logger.error(`${err.message} - command: urban.`);
			message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Phrase: \`${phrase}\` was not found on urban dictionary.` } }).then(m => m.delete({ timeout: 5000 }));
		} else {
			// send message
			const embed = new Discord.MessageEmbed()
				.setTitle(`Definition of ${phrase}`)
				.setURL(entries[0].permalink)
				.setThumbnail('https://i.imgur.com/VFXr0ID.jpg')
				.setDescription(`${entries[0].definition}\n**Example:**\n${entries[0].example}`)
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
