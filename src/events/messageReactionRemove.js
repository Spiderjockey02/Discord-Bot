// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../structures/Event');

module.exports = class messageReactionRemove extends Event {
	async run(bot, reaction, user) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Message reaction removed${!reaction.message.guild ? '' : ` in guild: ${reaction.message.guild.id}`}`);

		// Make sure it's not a BOT and in a guild
		if (user.bot) return;
		if (!reaction.message.guild) return;

		// If reaction needs to be fetched
		if (reaction.message.partial) await reaction.message.fetch();
		if (reaction.partial) await reaction.fetch();

		// Get server settings / if no settings then return
		const settings = reaction.message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event messageReactionRemove is for logging
		if (settings.ModLogEvents.includes('MESSAGEREACTIONREMOVE') && settings.ModLog) {
			const embed = new MessageEmbed()
				.setDescription(`**${user.toString()} unreacted with ${reaction.emoji.toString()} to [this message](${reaction.message.url})** `)
				.setColor(15158332)
				.setFooter(`User: ${user.id} | Message: ${reaction.message.id} `)
				.setAuthor(user.tag, user.displayAvatarURL())
				.setTimestamp();

			// Find channel and send message
			const modChannel = reaction.message.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
		}
	}
};
