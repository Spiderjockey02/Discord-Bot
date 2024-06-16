import { Guild, EmbedBuilder, APIEmbedField, RestOrArray, normalizeArray } from 'discord.js';
import EgglordClient from '../base/Egglord';

/**
 * EgglordEmbed
 * @extends {MessageEmbed}
*/
export default class EgglordEmbed extends EmbedBuilder {
	client: EgglordClient;
	guild: Guild | null;

	/**
	 * @param {Client} client The instantiating client
	 * @param {?guild} guild The guild of which the embed will be sent to
	 * @param {CommandData} data The data of the embed
	*/
	constructor(client: EgglordClient, guild: Guild | null, data = {}) {
		super(data);
		this.client = client;
		this.guild = guild;
		this.setColor(client.config.embedColor)
			.setTimestamp();
	}

	// Language translator for title
	setTitle(key: string, args?: { [key: string]: string }) {
		this.data.title = this.client.languageManager.translate(this.guild, key, args);
		return this;
	}

	addFields(...fields: RestOrArray<APIEmbedField>) {
		const normalizedFields = normalizeArray(fields);

		for (const field of normalizedFields) {
			field.name = this.client.languageManager.translate(this.guild, field.name);
		}

		if (this.data.fields) this.data.fields.push(...normalizedFields);
		else this.data.fields = normalizedFields;
		return this;
	}
}