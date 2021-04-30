// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class emojiUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, oldEmoji, newEmoji) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Emoji: ${newEmoji.name} has been deleted in guild: ${newEmoji.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = newEmoji.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event emojiUpdate is for logging
		if (settings.ModLogEvents.includes('EMOJIUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// emoji name change
			if (oldEmoji.name != newEmoji.name) {
				embed = new MessageEmbed()
					.setDescription('**Emoji name update**')
					.setColor(15105570)
					.setFooter(`ID: ${newEmoji.id}`)
					.setAuthor(newEmoji.guild.name, newEmoji.guild.iconURL())
					.addFields(
						{ name: 'Old:', value: `${oldEmoji.name}`, inline: true },
						{ name: 'New:', value: `${newEmoji.name}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// emoji role update
			if (oldEmoji.roles != newEmoji.roles) {
				console.log(oldEmoji.roles);
				console.log(newEmoji.roles);
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newEmoji.guild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newEmoji.guild.id) bot.addEmbed(modChannel.id, embed);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
};
