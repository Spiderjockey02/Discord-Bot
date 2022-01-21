// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Role delete event
 * @event Egglord#RoleDelete
 * @extends {Event}
*/
class RoleDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Role} role The role that was deleted
	 * @readonly
	*/
	async run(bot, role) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Role: ${role.name} has been deleted in guild: ${role.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = role.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event roleDelete is for logging
		if (settings.ModLogEvents?.includes('ROLEDELETE') && settings.ModLog) {
			const embed = new Embed(bot, role.guild)
				.setDescription(`**Role: ${role} (${role.name}) was deleted**`)
				.setColor(15158332)
				.setFooter({ text: `ID: ${role.id}` })
				.setAuthor({ name: role.guild.name, iconURL: role.guild.iconURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${role.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == role.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = RoleDelete;
