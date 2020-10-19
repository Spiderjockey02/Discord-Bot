// This file is for sharding
const { ShardingManager } = require('discord.js');

const manager = new ShardingManager('./bot.js', {
	// Sharding options
	totalShards: 'auto',
	token: require('./config.js').token,
});

// Spawn your shards
manager.spawn().then(require('./modules/logging/logger').log('=-=-=-=-=-=-=- Loading shard(s) -=-=-=-=-=-=-='));

// Emitted when a shard is created
manager.on('shardCreate', (shard) => {
	require('./modules/logging/logger').log(`Shard ${shard.id} launched`);
});
