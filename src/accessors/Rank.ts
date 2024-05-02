import { client } from './client';

export default class RankManager {
	async fetchByUserAndGuild(userId: string, guildId: string) {
		return client.rank.findUnique({
			where: {
				id: {
					userId, guildId,
				},
			},
		});
	}

	async fetchByGuildId(guildId: string) {
		return client.rank.findMany({
			where: {
				guildId,
			},
		});
	}
}
