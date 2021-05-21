const { MessageEmbed } = require('discord.js');

module.exports = class EgglordEmbed extends MessageEmbed {
	constructor(bot, guild, data = {}) {
		super(data);
		this.bot = bot;
		this.guild = guild;
		this.setColor('RANDOM')
			.setTimestamp();
	}

	// Language translator for title
	setTitle(key, args) {
		this.title = this.bot.translate(key, args, this.guild.settings.Language) ? this.bot.translate(key, args, this.guild.settings.Language) : key;
		return this;
	}

	// Language translator for footer
	setFooter(key, args, icon) {
		if (typeof args === 'object') {
			this.footer = {
				text: this.bot.translate(key, args, this.guild.settings.Language),
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
