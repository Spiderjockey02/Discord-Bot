import { Rank } from '@prisma/client';
import { client } from './client';

export async function fetchByUserAndGuild(userId: string, guildId: string) {
	return client.rank.findUnique({
		where: {
			id: {
				userId, guildId,
			},
		},
	});
}

export async function fetchByGuildId(guildId: string) {
	return client.rank.findMany({
		where: {
			guildId,
		},
	});
}

export async function createRank(userId: string, guildId: string) {
	return client.rank.create({
		data: {
			userId, guildId,
		},
	});
}

export async function updateRank(data: Rank) {
	return client.rank.update({
		where: {
			id: {
				userId: data.userId,
				guildId: data.guildId,
			},
		},
		data: {
			level: data.level,
			xp: data.xp,
		},
	});
}