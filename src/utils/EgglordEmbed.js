const { MessageEmbed } = require('discord.js');

module.exports = class EgglordEmbed extends MessageEmbed {
	constructor(bot, guild, data = {}) {
		super(data);
		this.bot = bot;
		this.guild = guild;
		this.setColor(bot.config.embedColor)
			.setTimestamp();
	}

	// Language translator for title
	setTitle(key, args) {
		const language = this.guild?.settings.Language ?? this.bot.config.defaultSettings.Language;
		this.title = this.bot.translate(key, args, language) ? this.bot.translate(key, args, language) : key;
		return this;
	}

	// Language translator for footer
	setFooter(key, args, icon) {
		if (typeof args === 'object') {
			const language = this.guild?.settings.Language ?? this.bot.config.defaultSettings.Language;
			this.footer = {
				text: this.bot.translate(key, args, language),
				iconURL: icon,
			};
		} else {
			this.footer = {
				text: key,
				iconURL: args,
			};
		}
		return this;
	}
};
