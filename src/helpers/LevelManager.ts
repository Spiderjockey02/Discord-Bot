import { Prisma, Rank } from '@prisma/client';
import { Collection, GuildMember, GuildTextBasedChannel, Message, MessageType } from 'discord.js';
import fetchLevelSettings from '../accessors/Settings';
import { fetchByUserAndGuild, createRank, updateRank } from '../accessors/Rank';
import CONSTANTS from '../utils/CONSTANTS';
import { levelSettingType } from '../types/database';
import EgglordClient from '../base/Egglord';

export default class LevelManager {
	cache: Collection<string, Rank>;
	cooldown: Set<string>;
	guildId: string;
	client: EgglordClient;
	private settings: Prisma.LevelSystemGetPayload<typeof levelSettingType> | null;
	constructor(client: EgglordClient, guildId: string) {
		this.cache = new Collection();
		this.cooldown = new Set();
		this.guildId = guildId;
		this.settings = null;
		this.client = client;

		// Fetch the level settings
		this.fetchSettings();
	}

	/**
	 * Validate a message for level settings
	 * @param {Message<true>} message The message to validate
	 * @return {Promise<Boolean>}
	*/
	async validate(message: Message<true>): Promise<boolean> {
		if (message.type !== MessageType.Default) return false;

		// Fetch level settings
		if (this.settings == null) return false;

		// Check if the message was sent in an ignored channel
		if (this.settings.ignoredChannels.map(c => c.id).includes(message.channel.id)) return false;

		// Check if the author has an ignored role
		if (this.settings.ignoredRoles.map(r => r.id).some(r => message.member?.roles.cache.map(ro => ro.id).includes(r))) return false;

		// Check if author is in cooldown
		if (this.cooldown.has(message.author.id)) return false;

		// The message would have passed validation
		return true;
	}

	/**
	 * Calculate new XP and check if they have leveled up
	 * @param {Message<true>} message The message to validate
	*/
	async calculateXP(message: Message<true>) {
		const xpAdd = Math.round(Math.floor(CONSTANTS.XP_GAINED() * (this.settings?.multiplier ?? 1)));
		const settings = this.settings as Prisma.LevelSystemGetPayload<typeof levelSettingType>;

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
			// For debugging purposes
			this.client.logger.debug(`${message.author.displayName} just leveled up to ${userRank.level} in guild: ${message.guild.name}`);

			// Check how to send the message
			switch (settings.annoucementType) {
				case 'CHANNEL': {
					if (settings.annoucementChannelId) {
						const channel = message.guild.channels.cache.get(settings.annoucementChannelId) as GuildTextBasedChannel;
						if (channel) channel.send(settings.annoucementMessage.replace('{user}', `${message.member}`).replace('{level}', `${userRank.level}`));
					}
					break;
				}
				case 'REPLY': {
					message.reply(settings.annoucementMessage);
					break;
				}
			}
			this.addRank(userRank);
			this.checkRoleRewards(userRank.level, message.member ?? undefined);
		}
	}

	/**
	 * Check what role rewards to give to the member
	 * @param {number} level The user's level
	 * @param {?GuildMember} member The member who will receive the rewards
	 * @return {Promise<Boolean>}
	*/
	private async checkRoleRewards(level: number, member?: GuildMember): Promise<boolean|undefined> {
		try {
			// Give the user their role rewards (if neededed)
			const roles = this.settings?.roleRewards ?? [];
			if (roles.length > 0) {

				// Check what roles to give
				const giveRoles: string[] = [];
				for (const role of roles) {
					if (role.level < level) giveRoles.push(role.roleId);
				}

				// Add roles to user
				await member?.roles.add(giveRoles);
				return true;
			}
		} catch (error) {
			this.client.logger.error(`Failed to give member: ${member?.id} their role rewards.`);
			return false;
		}
	}

	/**
	 * Fetch the user's rank from cache or database
	 * @param {string} userId The user's id
	 * @return {Promise<Rank | null>}
	*/
	async fetch(userId: string): Promise<Rank | null> {
		if (this.cache.has(userId)) {
			return this.cache.get(userId) ?? null;
		} else {
			return fetchByUserAndGuild(userId, this.guildId);
		}
	}

	/**
	 * Add the user's rank to cache, database and to cooldown
	 * @param {Rank} userRank The rank to interact with
	*/
	private async addRank(userRank: Rank) {
		// Add to database, cooldown and cache
		await updateRank(userRank);
		this.cooldown.add(userRank.memberId);
		this.cache.set(userRank.memberId, userRank);

		// Remove user from cooldown after X time (default 1 minute)
		setTimeout(() => {
			this.cooldown.delete(userRank.memberId);
		}, CONSTANTS.INTERVAL_BETWEEN_XP);
	}

	/**
	 * Fetch the guild's level settings
	*/
	private async fetchSettings() {
		this.settings = await fetchLevelSettings(this.guildId);
		return this.settings;
	}
}