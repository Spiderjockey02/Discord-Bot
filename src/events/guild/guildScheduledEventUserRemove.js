// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Guild event user remove event
 * @event Egglord#guildScheduledEventUserRemove
 * @extends {Event}
*/
class GuildScheduledEventUserRemove extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {guildScheduledEvent} guildEvent The guild event the user left
	 * @param {User} user The user who left the event
	 * @readonly
	*/
	async run(bot, guildEvent, user) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`User: ${user.tag} has left event: ${guildEvent.name} in guild: ${guildEvent.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = guildEvent.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildEventCreate is for logging
		if (settings.ModLogEvents?.includes('EVENTUSERREMOVE') && settings.ModLog) {
			const embed = new Embed(bot, guildEvent.guild)
				.setDescription([
					`${user.tag} left event: [${guildEvent.name}](${guildEvent})`,
					'',
					`There are still ${guildEvent.userCount ?? 0} users subscribed to the event.`,
				].join('\n'))
				.setColor(15158332)
				.setFooter({ text: guildEvent.guild.translate('misc:ID', { ID: guildEvent.guild.id }) })
				.setAuthor({ name: bot.user.username, iconURL: bot.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${guildEvent.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guildEvent.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = GuildScheduledEventUserRemove;
