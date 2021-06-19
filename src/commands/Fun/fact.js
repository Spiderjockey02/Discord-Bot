// Dependencies
const fs = require('fs'),
	{ Embed } = require('../../utils'),
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
			slash: true,
			cooldown: 1000,
		});
	}

	// Function for message command
	async run(bot, message) {
		// Get the random facts file
		fs.readFile('./src/assets/json/random-facts.json', (err, data) => {
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			// Retrieve a random fact
			const { facts } = JSON.parse(data);
			const num = Math.floor((Math.random() * facts.length));
			const embed = new Embed(bot, message.guild)
				.setTitle('fun/fact:FACT_TITLE')
				.setDescription(facts[num]);
			message.channel.send({ embeds: [embed] });
		});
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelID);
		fs.readFile('./src/assets/json/random-facts.json', async (err, data) => {
			if (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				await bot.send(interaction, {embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true});
			}

			// Retrieve a random fact
			const { facts } = JSON.parse(data);
			const num = Math.floor((Math.random() * facts.length));
			const embed = new Embed(bot, guild)
				.setTitle('fun/fact:FACT_TITLE')
				.setDescription(facts[num]);
			await bot.send(interaction, {embeds: [embed]});
		});
	}
};
