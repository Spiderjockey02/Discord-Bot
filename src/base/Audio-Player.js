// import the Manager class from lavacord
const { Manager } = require('@lavacord/discord.js');

// Define the nodes array as an example
const nodes = [
	{ id: '1', host: 'localhost', port: 2333, password: 'youshallnotpass' },
];
module.exports = async (bot) => {
	bot.logger.log('Connecting to Lavalink server.');
	const manager = new Manager(bot, nodes, {
		user: bot.user.id,
		shards: bot.shard ? bot.shard.count : 1,
	});
	// Connects all the LavalinkNode WebSockets
	await manager.connect().then(() => {
		bot.logger.log('Lavalink server connected', 'ready');
	});

	// The error event, which you should handle otherwise your application will crash when an error is emitted
	manager.on('error', (error, node) => {
		console.log('error: ' + error);
		console.log('node: ' + node);
	});
	bot.AudioPlayer = manager;
};
