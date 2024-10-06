import { User } from '@prisma/client';
import { client } from './client';
import { Collection } from 'discord.js';
import { UserUpdateProps } from 'types/database';

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

	async update(userId: string, newUser: UserUpdateProps) {
		return client.user.upsert({
			where: {
				id: userId,
			},
			update: {
				isPremiumTo: newUser.isPremiumTo,
				isSupport: newUser.isSupport,
				isDev: newUser.isDev,
				isContributor: newUser.isContributor,
				isBanned: newUser.isBanned,
			},
			create: {
				isPremiumTo: newUser.isPremiumTo,
				isSupport: newUser.isSupport,
				isDev: newUser.isDev,
				isContributor: newUser.isContributor,
				isBanned: newUser.isBanned,
				id: userId,
			},
		});
	}
}

