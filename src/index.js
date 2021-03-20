const logger = require('./utils/logger');

(async function load() {
	try {
		await require('./scripts/update-database-v1.1')();
	} catch (e) {
		console.log(e);
	}

	// This is to verify config file
	const configCorrect = await require('./scripts/verify-config.js').run(require('./config.js'));
	if (!configCorrect) {
		// This file is for sharding
		const { ShardingManager } = require('discord.js');

		// Create sharding manager
		const manager = new ShardingManager('./src/bot.js', {
			// Sharding options
			totalShards: 'auto',
			token: require('./config.js').token,
		});

		// Spawn your shards
		manager.spawn().then(logger.log('=-=-=-=-=-=-=- Loading shard(s) -=-=-=-=-=-=-='));

		// Emitted when a shard is created
		manager.on('shardCreate', (shard) => {
			logger.log(`Shard ${shard.id} launched`);
		});
	} else {
		logger.error('Please fix your errors before loading the bot.');
		process.exit();
	}
})();
