// Dependencies
import 'module-alias/register';
import { Logger } from './utils';
import { ShardingManager } from 'discord.js';
import { validateConfig } from './scripts/verify-config';
// import config from './config';
const logger = new Logger();

(async () => {

	// This is to verify the config file
	const configCorrect = await validateConfig(config);

	if (!configCorrect) {
		// Create sharding manager
		const manager = new ShardingManager(`${process.cwd()}/dist/bot.js`, {
			// Sharding options
			totalShards: 'auto',
			token: config.token,
		});

		// Spawn your shards
		logger.log('=-=-=-=-=-=-=- Loading shard(s) -=-=-=-=-=-=-=');
		try {
			await manager.spawn();
		} catch (err: unknown) {
			logger.error(`Error loading shards: ${(err as Error).message}`);
		}

		// Emitted when a shard is created
		manager.on('shardCreate', (shard) => {
			logger.log(`Shard ${shard.id} launched`);
		});
	} else {
		logger.error('Please fix your errors before loading the client.');
		process.exit();
	}
})();
