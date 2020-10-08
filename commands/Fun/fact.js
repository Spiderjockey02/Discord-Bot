// Dependencies
const fs = require('fs');
const Discord = require('discord.js');

module.exports.run = async (bot, message, args, emojis) => {
	// Get the random facts file
	fs.readFile('././storage/resources/random-facts.json', (err, data) => {
		if (err) {
			bot.logger.error(err.message);
			message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 5000 }));
			message.delete();
			return;
		}
		const facts = JSON.parse(data);
		// Retrieve a random fact
		const num = (Math.floor((Math.random() * facts.facts.length) + 0));
		const embed = new Discord.MessageEmbed()
			.setTitle('Random Fact:')
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
