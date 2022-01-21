// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Thread update event
 * @event Egglord#ThreadUpdate
 * @extends {Event}
*/
class ThreadUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {ThreadChannel} oldThread The thread before the update
	 * @param {ThreadChannel} newThread The thread after the update
	 * @readonly
	*/
	async run(bot, oldThread, newThread) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Thread: ${newThread.name} has been updated in guild: ${newThread.guildId}. (${newThread.type.split('_')[1]})`);

		// Get server settings / if no settings then return
		const settings = newThread.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('THREADUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// thread name change
			if (oldThread.name != newThread.name) {
				embed = new Embed(bot, newThread.guild)
					.setDescription(`**Thread name changed of ${newThread.toString()}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newThread.id}` })
					.setAuthor({ name: newThread.guild.name, iconURL: newThread.guild.iconURL() })
					.addFields(
						{ name: 'Old:', value: `${oldThread.name}`, inline: true },
						{ name: 'New:', value: `${newThread.name}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// thread archive state change
			if (oldThread.archived != newThread.archived) {
				embed = new Embed(bot, newThread.guild)
					.setDescription(`**Thread archive state changed of ${newThread.toString()}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newThread.id}` })
					.setAuthor({ name: newThread.guild.name, iconURL: newThread.guild.iconURL() })
					.addFields(
						{ name: 'Old:', value: `${oldThread.archived}`, inline: true },
						{ name: 'New:', value: `${newThread.archived}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// Find channel and send message
			if (updated) {
				try {
					const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newThread.guild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newThread.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}

module.exports = ThreadUpdate;
