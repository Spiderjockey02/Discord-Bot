import { BaseGuild, EmbedBuilder } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

/**
 * EgglordEmbed
 * @extends {MessageEmbed}
*/
export default class EgglordEmbed extends EmbedBuilder {
	client: EgglordClient;
	guild: BaseGuild;

	/**
	 * @param {Client} client The instantiating client
	 * @param {?guild} guild The guild of which the embed will be sent to
	 * @param {CommandData} data The data of the embed
	*/
	constructor(client: EgglordClient, guild: BaseGuild, data = {}) {
		super(data);
		this.client = client;
		this.guild = guild;
		this.setColor(client.config.embedColor)
			.setTimestamp();
	}

	// Language translator for title
	setTitle(key: string, args?: { [key: string]: string }) {
		this.data.title = this.guild.translate(key, args);
		return this;
	}
}
