import axios from 'axios';
import { BaseGuildTextChannel, ChannelType, DMChannel, Message, EmbedBuilder, Guild } from 'discord.js';
import config from '../config';
import Logger from './Logger';
const logger = new Logger();

export function checkNSFW(channel: BaseGuildTextChannel | DMChannel) {
	if (channel.type == ChannelType.DM) return true;
	return channel.nsfw;
}

export function CalcLevenDist(str1 = '', str2 = '') {
	const track = Array(str2.length + 1).fill(null).map(() =>
		Array(str1.length + 1).fill(null));
	for (let i = 0; i <= str1.length; i += 1) {
		track[0][i] = i;
	}
	for (let j = 0; j <= str2.length; j += 1) {
		track[j][0] = j;
	}
	for (let j = 1; j <= str2.length; j += 1) {
		for (let i = 1; i <= str1.length; i += 1) {
			const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
			track[j][i] = Math.min(
				track[j][i - 1] + 1,
				track[j - 1][i] + 1,
				track[j - 1][i - 1] + indicator,
			);
		}
	}
	return track[str2.length][str1.length];
}

export function errorEmbed(guild: Guild, key: string, args?: {[key: string]: string}) {
	const emoji = guild.client.customEmojis['cross'];
	const embed = new EmbedBuilder()
		.setColor(15158332)
		.setDescription(`${emoji} ${guild.translate(key, args) ?? key}`);
	return embed;
}

export function successEmbed(guild: Guild, key: string, args?: {[key: string]: string}) {
	const emoji = guild.client.customEmojis['checkmark'];
	const embed = new EmbedBuilder()
		.setColor(3066993)
		.setDescription(`${emoji} ${guild.translate(key, args) ?? key}`);
	return embed;
}

export function delayedDelete(message: Message, ms: number) {
	setTimeout(() => {
		message.delete();
	}, ms || 3000);
}

/**
	 * Function for adding embeds to the webhook manager. (Stops API abuse)
	 * @param {string} endpoint The key to search up
	 * @readonly
	*/
export async function fetchFromAPI(endpoint: string, query = {}) {
	try {
		if (endpoint.startsWith('image') || endpoint == 'misc/qrcode') {
			const { data } = await axios.get(`https://api.egglord.dev/api/${endpoint}?${new URLSearchParams(query)}`, {
				headers: { 'Authorization': config.api_keys.masterToken },
				responseType: 'arraybuffer',
			});
			return data;
		} else {
			const { data } = await axios.get(`https://api.egglord.dev/api/${endpoint}?${new URLSearchParams(query)}`, {
				headers: { 'Authorization': config.api_keys.masterToken },
			});

			// Check if error or not
			if (data.error) {
				return { error: data.error };
			} else {
				return data.data;
			}

		}
	} catch (err: any) {
		const error = err.response?.data.error ?? 'API website currently down';
		logger.error(error);
		return { error: error };
	}
}