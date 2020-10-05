module.exports.run = async (bot, message) => {
	// Pick Head or Tails
	const choices = ['Head', 'Tails'];
	message.channel.send(choices[Math.floor(Math.random() * choices.length)]);
};

module.exports.config = {
	command: 'flip',
	permission: ['SEND_MESSAGES'],
};

module.exports.help = {
	name: 'Flip',
	category: 'Fun',
	description: 'Flip a coin.',
	usage: '${PREFIX}flip',
};
