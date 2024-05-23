const { EmbedBuilder } = require('discord.js');

/**
 * EgglordEmbed
 * @extends {MessageEmbed}
*/
class EgglordEmbed extends EmbedBuilder {
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
			.setFooter({ text: '©CSJGamingTV', iconURL: 'https://csjgaming.com/wp-content/uploads/2021/01/cropped-CSJmain-32x32.png' })
			.setTimestamp();
	}

	// Language translator for title
	setTitle(key, args) {
		const language = this.guild.settings?.Language ?? require('../assets/json/defaultGuildSettings.json').Language;
		this.data.title = this.bot.translate(key, args, language) ? this.bot.translate(key, args, language) : key;
		return this;
	}
}

module.exports = EgglordEmbed;
