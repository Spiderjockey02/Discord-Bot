// Dependencies
const { logger } = require('./utils');
import { ShardingManager } from "discord.js";

(async () => {

	// This is to verify the config file
	const configCorrect = await require('./scripts/verify-config.js')(require('./config.js'));

	if (!configCorrect) {
		// Create sharding manager
		const manager = new ShardingManager('./src/bot.js', {
			// Sharding options
			totalShards: 'auto',
			token: require('./config.js').token,
		});

		// Spawn your shards
		logger.log('=-=-=-=-=-=-=- Loading shard(s) -=-=-=-=-=-=-=');
		try {
			await manager.spawn();
		} catch (err: any) {
			logger.error(`Error loading shards: ${err.message}`);
		}

		// Emitted when a shard is created
		manager.on('shardCreate', (shard) => {
			logger.log(`Shard ${shard.id} launched`);
		});
	} else {
		logger.error('Please fix your errors before loading the bot.');
		process.exit();
	}
})();
