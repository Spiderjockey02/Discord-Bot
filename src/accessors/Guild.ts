import { Collection } from 'discord.js';
import { client } from './client';
import { Guild } from '@prisma/client';

export default class GuildManager {
	cache: Collection<string, Guild>;
	constructor() {
		this.cache = new Collection();
	}

	async fetchAll() {
		const guilds = await client.guild.findMany();

		for (const guild of guilds) {
			this.cache.set(guild.id, guild);
		}

		return guilds;
	}

	async fetchById(guildId: string) {
		if (this.cache.get(guildId)) {
			return this.cache.get(guildId);
		} else {
			return client.guild.findUnique({
				where: {
					id: guildId,
				},
			});
		}
	}

	async fetchRanksById(guildId: string) {
		return client.guild.findUnique({
			where: {
				id: guildId,
			},
			include: {
				ranks: true,
			},
		});
	}

	async fetchSettingsById(guildId: string) {
		return client.setting.findUnique({
			where: {
				guildId,
			},
			include: {
				musicSystem: true,
				levelSystem: true,
				welcomeSystem: {
					include: {
						joinRolesGive: true,
					},
				},
				moderationSystem: {
					include: {
						loggingEvents: true,
					},
				},
				ticketSystem: true,
			},
		});
	}
}

