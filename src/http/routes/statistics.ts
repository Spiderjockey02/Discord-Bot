// Dependencies
import { Router } from 'express';
import EgglordClient from 'src/base/Egglord';
import { ChannelType } from 'discord.js';
const router = Router();

export function run(client: EgglordClient) {
	// statistics page
	router.get('/', async (_req, res) => {

		const textChannelFilter = [ChannelType.GuildCategory, ChannelType.GuildDirectory];
		const voiceChannelFilter = [ChannelType.GuildVoice, ChannelType.GuildStageVoice];
		const categoryChannelFilter = [ChannelType.GuildCategory];

		res.json({
			guildCount: client.guilds.cache.size,
			userCount: client.users.cache.size,
			uptime: Math.round(process.uptime() * 1000),
			commandCount: client.commandManager.commands.size,
			memoryUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			channels: {
				text: client.channels.cache.filter(c => !textChannelFilter.includes(c.type)).size,
				category: client.channels.cache.filter(c => categoryChannelFilter.includes(c.type)).size,
				voice: client.channels.cache.filter(c => voiceChannelFilter.includes(c.type)).size,
			},
			MessagesSeen: 0,
			CommandsRan: 0,
			ping: Math.round(client.ws.ping),
			Lavalink: client.audioManager?.nodes.map(node => ({
				name: node.options.identifier,
				stats: node.stats,
			})),
		});
	});

	return router;
}