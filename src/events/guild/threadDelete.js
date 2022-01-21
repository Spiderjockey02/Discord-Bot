// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Thread delete event
 * @event Egglord#ThreadDelete
 * @extends {Event}
*/
class ThreadDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {ThreadChannel} thread The thread that was deleted
	 * @readonly
	*/
	async run(bot, thread) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Thread: ${thread.name} has been deleted in guild: ${thread.guildId}. (${thread.type.split('_')[1]})`);

		// Get server settings / if no settings then return
		const settings = thread.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('THREADDELETE') && settings.ModLog) {
			const embed = new Embed(bot, thread.guild)
				.setDescription([
					`**${thread.type.split('_')[1].toLowerCase()} thread deleted: ${thread.toString()}**`,
					'',
					`Owner: ${bot.users.cache.get(thread.ownerId)?.tag}`,
				].join('\n'))
				.setColor(15158332)
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

module.exports = ThreadDelete;
