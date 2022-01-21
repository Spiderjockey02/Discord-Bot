// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Thread create event
 * @event Egglord#ThreadCreate
 * @extends {Event}
*/
class ThreadCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {ThreadChannel} thread The thread that was created
	 * @readonly
	*/
	async run(bot, thread) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Thread: ${thread.name} has been created in guild: ${thread.guildId}. (${thread.type.split('_')[1]})`);

		// The bot should try and join the thread for auto-mod and command usage
		try {
			await thread.join();
		} catch (err) {
			bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Get server settings / if no settings then return
		const settings = thread.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('THREADCREATE') && settings.ModLog) {
			const embed = new Embed(bot, thread.guild)
				.setDescription([
					`**${thread.type.split('_')[1].toLowerCase()} thread created: ${thread.toString()}**`,
					'',
					`Owner: ${bot.users.cache.get(thread.ownerId)?.tag}`,
				].join('\n'))
				.setColor(3066993)
				.setFooter({ text: thread.guild.translate('misc:ID', { ID: thread.id }) })
				.setAuthor({ name: bot.user.username, iconURL: bot.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${thread.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == thread.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = ThreadCreate;
