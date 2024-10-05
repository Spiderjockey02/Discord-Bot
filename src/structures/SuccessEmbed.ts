import EgglordClient from 'base/Egglord';
import { Colors, EmbedBuilder, Guild } from 'discord.js';

export default class SuccessEmbed extends EmbedBuilder {
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
		this.setColor(Colors.Green)
			.setTimestamp();
	}

	setMessage(key: string, args?: {[key: string]: string}) {
		const translation = this.client.languageManager.translate(this.guild, key, args);

		this.data.description = `${this.client.customEmojis['checkmark']} ${translation}`;
		return this;
	}
}