// First ever Egglord command
module.exports.run = async (bot, message) => {
	message.channel.send('Pong!');
};

module.exports.config = {
	command: 'ping',
	aliases: ['ping'],
};

module.exports.help = {
	name: 'ban',
	category: 'Fun',
	description: 'Pong',
	usage: '!ping',
};
