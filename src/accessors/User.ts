import { User } from '@prisma/client';
import { client } from './client';
import { Collection } from 'discord.js';

export default class UserManager {
	cache: Collection<string, User>;
	constructor() {
		this.cache = new Collection();
	}

	async fetchAll() {
		return client.user.findMany();
	}

	async fetchById(userId: string) {
		return client.user.findUnique({
			where: {
				id: userId,
			},
		});
	}

	async update(userId: string, premium?: Date) {
		return client.user.upsert({
			where: {
				id: userId,
			},
			update: {
				isPremiumTo: premium,
			},
			create: {
				isPremiumTo: premium,
				id: userId,
			},
		});
	}
}

