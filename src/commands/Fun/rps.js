// Dependencies
const { MessageEmbed } = require('discord.js');
const choices = ['rock', 'paper', 'scissors'];

module.exports.run = async (bot, message, args, settings) => {
	// Make sure a choice was made
	if (!args[0]) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('rps').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	// Check that the response is from choices
	if (!choices.includes(args[0].toLowerCase())) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('rps').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	// Make sure rock, paper or scissors was their choice
	if (args[0].includes('paper') || args[0].includes('rock') || args[0].includes('scissors')) {

		// Bot decision time
		const choice = choices[Math.floor(Math.random() * choices.length)];
		let winner;
		if (choice == args[0]) {
			winner = 'no one';
		} else if ((choice == 'rock' && args[0] == 'scissors') || (choice == 'paper' && args[0] == 'rock') || (choice == 'scissors' && args[0] == 'paper')) {
			winner = 'bot';
		} else {
			winner = 'user';
		}

		// send results
		const embed = new MessageEmbed()
			.setTitle('Rock Paper Scissors')
			.setDescription(`**${message.translate(settings.Language, 'FUN/RPS_FIRST')}:** ${args[0]}
      **${message.translate(settings.Language, 'FUN/RPS_SECOND')}:** ${choice}\n
      ${message.translate(settings.Language, 'FUN/RPS_RESULT', winner)}`);
		message.channel.send(embed);
	}
};

module.exports.config = {
	command: 'rps',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Rock, Paper, Scissors',
	category: 'Fun',
	description: 'Play Rock Paper Scissors.',
	usage: '${PREFIX}rps <rock | paper | scissors>',
	example: '${PREFIX}rps rock',
};
