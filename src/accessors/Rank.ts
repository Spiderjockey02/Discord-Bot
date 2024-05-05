import { Rank } from '@prisma/client';
import { client } from './client';

export async function fetchByUserAndGuild(userId: string, guildId: string) {
	return client.rank.findUnique({
		where: {
			id: {
				memberId: userId, guildId,
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
			memberId: userId, guildId,
		},
	});
}

export async function updateRank(data: Rank) {
	return client.rank.update({
		where: {
			id: {
				memberId: data.memberId,
				guildId: data.guildId,
			},
		},
		data: {
			level: data.level,
			xp: data.xp,
		},
	});
}