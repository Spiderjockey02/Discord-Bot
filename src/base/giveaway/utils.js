const { Util } = require('discord.js');

module.exports.validateEmbedColor = (embedColor) => {
	try {
		embedColor = Util.resolveColor(embedColor);
		return Number.isFinite(embedColor);
	} catch {
		return false;
	}
};
