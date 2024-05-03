import { Rank } from '@prisma/client';
import { Collection, GuildTextBasedChannel, Message, MessageType } from 'discord.js';
import fetchLevelSettings from '../accessors/Settings';
import { fetchByUserAndGuild, createRank, updateRank } from '../accessors/Rank';
import CONSTANTS from '../utils/CONSTANTS';

export default class LevelManager {
	cache: Collection<string, Rank>;
	cooldown: Set<string>;
	guildId: string;
	constructor(guildId: string) {
		this.cache = new Collection();
		this.cooldown = new Set();
		this.guildId = guildId;
	}

	async check(message: Message<true>) {
		if (message.type !== MessageType.Default) return false;

		// Fetch level settings
		const levelSettings = await fetchLevelSettings(message.guild.id);
		if (levelSettings == null) return false;

		// Check if the message was sent in an ignored channel
		if (levelSettings.ignoredChannels.map(c => c.id).includes(message.channel.id)) return false;

		// Check if the author has an ignored role
		if (levelSettings.ignoredRoles.map(r => r.id).some(r => message.member?.roles.cache.map(ro => ro.id).includes(r))) return false;

		// Check if author is in cooldown
		if (this.cooldown.has(message.author.id)) return false;

		// Calculate how much XP to give to user
		const xpAdd = Math.round(Math.floor(CONSTANTS.XP_GAINED() * (levelSettings?.multiplier ?? 1)));

		// Fetch user from cache or database if doesn't exist create the document
		let userRank = await this.fetch(message.author.id);
		if (!userRank) userRank = await createRank(message.author.id, this.guildId);

		// Add XP to User
		userRank.xp += xpAdd;

		// Calculate new level
		let levelHasChanged = false;
		while (userRank.xp >= (5 * (userRank.level ** 2) + 50 * userRank.level + 100)) {
			userRank.level += 1;
			levelHasChanged = true;
		}

		// Check for response to be sent
		if (levelHasChanged) {
			// For debugged
			if (message.guild.client.config.debug) message.guild.client.logger.debug(`${message.author.displayName} just leveled up to ${userRank.level} in guild: ${message.guild.name}`);

			// Check how to send the message
			switch (levelSettings.annoucementType) {
				case 'CHANNEL': {
					if (levelSettings.annoucementChannelId) {
						const channel = message.guild.channels.cache.get(levelSettings.annoucementChannelId) as GuildTextBasedChannel;
						if (channel) channel.send(levelSettings.annoucementMessage.replace('{user}', `${message.member}`).replace('{level}', `${userRank.level}`));
					}
					break;
				}
				case 'REPLY': {
					message.reply(levelSettings.annoucementMessage);
					break;
				}
			}

			// Give the user their role rewards (if neededed)
			const roles = levelSettings.roleRewards;
			if (roles.length > 0) {

				// Check what roles to give
				const giveRoles: string[] = [];
				for (const role of roles) {
					if (role.level < userRank.level) giveRoles.push(role.roleId);
				}

				// Add roles to user
				message.member?.roles.add(giveRoles);
			}
		}

		// Update the database and manage cooldown
		this.addRank(userRank);
		return true;
	}

	async fetch(userId: string) {
		if (this.cache.has(userId)) {
			return this.cache.get(userId);
		} else {
			return fetchByUserAndGuild(userId, this.guildId);
		}
	}

	async addRank(userRank: Rank) {
		// Add to database, cooldown and cache
		await updateRank(userRank);
		this.cooldown.add(userRank.userId);
		this.cache.set(userRank.userId, userRank);

		// Remove user from cooldown after X time (default 1 minute)
		setTimeout(() => {
			this.cooldown.delete(userRank.userId);
			// Only gain XP every 1 minute
		}, CONSTANTS.INTERVAL_BETWEEN_XP);
	}
}