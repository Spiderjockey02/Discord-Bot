const { MessageEmbed } = require('discord.js');

module.exports = class EgglordEmbed extends MessageEmbed {
	constructor(message, data = {}) {
		super(data);
		this.message = message;
		this.setColor('RANDOM')
			.setTimestamp();
	}

	// Language translator for title
	setTitle(key, args) {
		this.title = this.message.translate(key, args) ? this.message.translate(key, args) : key;
		return this;
	}

	// Language translator for footer
	setFooter(key, args, icon) {
		if (typeof args === 'object') {
			this.footer = {
				text: this.message.translate(key, args),
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
