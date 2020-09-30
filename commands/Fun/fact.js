// Dependencies
const fs = require('fs');
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	// Get the random facts file
	fs.readFile('././storage/resources/random-facts.json', (err, data) => {
		if (err) throw err;
		const facts = JSON.parse(data);
		// Retrieve a random fact
		const num = (Math.floor((Math.random() * 3056) + 0));
		const embed = new Discord.MessageEmbed()
			.setTitle('Random Fact:')
			.setColor(5140347)
			.setDescription(facts.facts[num]);
		message.channel.send(embed);
	});
};

module.exports.config = {
	command: 'fact',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Fact',
	category: 'Fun',
	description: 'Sends a random fact',
	usage: '!fact',
};
