// import the Manager class from lavacord
const { Manager } = require('lavacord');

// Define the nodes array as an example
const nodes = [
	{ id: '1', host: 'localhost', port: 2333, password: 'youshallnotpass' },
];
module.exports = async (bot) => {
	bot.logger.log('Connecting to Lavalink server.');
	const manager = new Manager(nodes, {
		user: bot.user.id,
		shards: bot.shard ? bot.shard.count : 1,
		send: (packet) => {
			console.log(packet);
			// this needs to send the provided packet to discord using the method from your library. use the @lavacord package for the discord library you use if you don't understand this
		},
	});
	// Connects all the LavalinkNode WebSockets
	await manager.connect().then(() => {
		bot.logger.log('Lavalink server connected', 'ready');
	});

	// The error event, which you should handle otherwise your application will crash when an error is emitted
	manager
		.on('ready', node => console.log(`Node ${node.id} is ready!`))
		.on('disconnect', (ws, node) => console.log(`Node ${node.id} disconnected.`))
		.on('reconnecting', (node) => console.log(`Node ${node.id} tries to reconnect.`))
		.on('error', (error, node) => console.log(`Node ${node.id} got an error: ${error.message}`));

	bot.AudioPlayer = manager;
};
