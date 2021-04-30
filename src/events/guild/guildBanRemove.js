// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class guildBanRemove extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, guild, user) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${user.tag} has been unbanned in guild: ${guild.id}.`);

		// Get server settings / if no settings then return
		const settings = guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildBanRemove is for logging
		if (settings.ModLogEvents.includes('GUILDBANREMOVE') && settings.ModLog) {
			const embed = new MessageEmbed()
				.setDescription(`${user.toString()}\n${user.tag}`)
				.setFooter(`ID: ${user.id}`)
				.setThumbnail(`${user.displayAvatarURL()}`)
				.setAuthor('User: Unbanned')
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guild.id) bot.addEmbed(modChannel.id, embed);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
