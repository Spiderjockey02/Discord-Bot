// First ever Egglord command
module.exports.run = async (bot, message) => {
	message.channel.send('Pong!');
};

module.exports.config = {
	command: 'ping',
	permissions: ['SEND_MESSAGES'],
};

module.exports.help = {
	name: 'Ping',
	category: 'Fun',
	description: 'Pong.',
	usage: '${PREFIX}ping',
};
