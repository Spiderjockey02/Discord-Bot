// Dependencies
const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Get the random facts file
	fs.readFile('./src/assets/json/random-facts.json', (err, data) => {
		if (err) {
			if (bot.config.debug) bot.logger.error(`${err.message} - command: fact.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			if (message.deletable) message.delete();
			return;
		}
		const facts = JSON.parse(data);
		// Retrieve a random fact
		const num = (Math.floor((Math.random() * facts.facts.length) + 0));
		const embed = new MessageEmbed()
			.setTitle(message.translate(settings.Language, 'FUN/FACT_TITLE'))
			.setColor('RANDOM')
			.setDescription(facts.facts[num]);
		message.channel.send(embed);
	});
};

module.exports.config = {
	command: 'fact',
	aliases: ['facts'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Fact',
	category: 'Fun',
	description: 'Receive a random fact.',
	usage: '${PREFIX}fact',
};
