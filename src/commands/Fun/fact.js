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
	async run(bot, message, settings) {
		// Get the random facts file
		fs.readFile('./src/assets/json/random-facts.json', (err, data) => {
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
			}

			// Retrieve a random fact
			const facts = JSON.parse(data);
			const num = Math.floor((Math.random() * facts.facts.length));
			const embed = new MessageEmbed()
				.setTitle(`💡 ${bot.translate(settings.Language, 'FUN/FACT_TITLE')}`)
				.setColor('RANDOM')
				.setDescription(facts.facts[num]);
			message.channel.send(embed);
		});
	}
};
