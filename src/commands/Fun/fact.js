// Dependencies
const fs = require('fs'),
	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Fact extends Command {
	constructor(bot) {
		super(bot, {
			name: 'fact',
			dirname: __dirname,
			aliases: ['facts'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Receive a random fact.',
			usage: 'fact',
			cooldown: 1000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
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
	}
};
