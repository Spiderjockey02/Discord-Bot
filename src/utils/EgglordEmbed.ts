import { Client, EmbedBuilder, Guild } from 'discord.js'

/**
 * EgglordEmbed
 * @extends {MessageEmbed}
*/
export default class EgglordEmbed extends EmbedBuilder {
	bot: Client
	guild: Guild

	/**
	 * @param {Client} client The instantiating client
	 * @param {?guild} guild The guild of which the embed will be sent to
	 * @param {CommandData} data The data of the embed
	*/
	constructor(bot: Client, guild: Guild, data = {}) {
		super(data);
		this.bot = bot;
		this.guild = guild;
		this.setColor(bot.config.embedColor)
			.setTimestamp();
	}

	// Language translator for title
	// @over
	setTitle(key, args) {
		const language = this.guild.settings?.Language ?? require('../assets/json/defaultGuildSettings.json').Language;
		this.data.title = this.bot.translate(key, args, language) ? this.bot.translate(key, args, language) : key;
		return this;
	}
}
