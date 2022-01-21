const { MessageEmbed } = require('discord.js');

/**
 * EgglordEmbed
 * @extends {MessageEmbed}
*/
class EgglordEmbed extends MessageEmbed {
	/**
	 * @param {Client} client The instantiating client
	 * @param {?guild} guild The guild of which the embed will be sent to
	 * @param {CommandData} data The data of the embed
	*/
	constructor(bot, guild, data = {}) {
		super(data);
		this.bot = bot;
		this.guild = guild;
		this.setColor(bot.config.embedColor)
			.setTimestamp();
	}

	// Language translator for title
	setTitle(key, args) {
		const language = this.guild?.settings.Language ?? require('../assets/json/defaultGuildSettings.json').Language;
		this.title = this.bot.translate(key, args, language) ? this.bot.translate(key, args, language) : key;
		return this;
	}
}

module.exports = EgglordEmbed;
