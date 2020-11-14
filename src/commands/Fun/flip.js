module.exports.run = async (bot, message, args, settings) => {
	// Pick Head or Tails
	message.sendT(settings.Language, 'FUN/FLIP_CHOICE', Math.round(Math.random()));
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
