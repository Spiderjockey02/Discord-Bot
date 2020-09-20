//This file is for sharding
const { ShardingManager } = require('discord.js');

const manager = new ShardingManager('./bot.js', {
  //Sharding options
  totalShards: 'auto',
  token: 'NjQ3MjAzOTQyOTAzODQwNzc5.XdcTAw.gq5ffGBb2b1sKdjhB_bxo2ZuYH0'
});

// Spawn your shards
manager.spawn();

// Emitted when a shard is created
manager.on('shardCreate', (shard) => require("./modules/logging/logger").log(`Shard ${shard.id} launched`));
