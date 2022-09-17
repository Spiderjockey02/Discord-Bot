// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Role update event
 * @event Egglord#RoleUpdate
 * @extends {Event}
*/
class RoleUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Role} oldRole The role before the update
	 * @param {Role} newRole The role after the update
	 * @readonly
	*/
	async run(bot, oldRole, newRole) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Role: ${newRole.name} has been updated in guild: ${newRole.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = newRole.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event roleUpdate is for logging
		if (settings.ModLogEvents?.includes('ROLEUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// role name change
			if (oldRole.name != newRole.name) {
				embed = new Embed(bot, newRole.guild)
					.setDescription(`**Role name of ${newRole} (${newRole.name}) changed**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newRole.id}` })
					.setAuthor({ name: newRole.guild.name, iconURL: newRole.guild.iconURL() })
					.addFields(
						{ name: 'Before:', value: oldRole.name },
						{ name: 'After:', value: newRole.name },
					)
					.setTimestamp();
				updated = true;
			}

			// role colour change
			if (oldRole.color != newRole.color) {
				embed = new Embed(bot, newRole.guild)
					.setDescription(`**Role name of ${newRole} (${newRole.name}) changed**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newRole.id}` })
					.setAuthor({ name: newRole.guild.name, iconURL: newRole.guild.iconURL() })
					.addFields(
						{ name: 'Before:', value: `${oldRole.color} ([${oldRole.hexColor}](https://www.color-hex.com/color/${oldRole.hexColor.slice(1)}))` },
						{ name: 'After:', value: `${newRole.color} ([${newRole.hexColor}](https://www.color-hex.com/color/${newRole.hexColor.slice(1)}))` },
					)
					.setTimestamp();
				updated = true;
			}

			// role permission change
			if (oldRole.permissions.bitfield != newRole.permissions.bitfield) {
				embed = new Embed(bot, newRole.guild)
					.setDescription(`**Role permissions of ${newRole} (${newRole.name}) changed**\n[What those numbers mean](https://discordapi.com/permissions.html#${oldRole.permissions.bitfield})`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newRole.id}` })
					.setAuthor({ name: newRole.guild.name, iconURL: newRole.guild.iconURL() })
					.addFields(
						{ name: 'Before:', value:`${oldRole.permissions.bitfield}` },
						{ name: 'After:', value: `${newRole.permissions.bitfield}` },
					)
					.setTimestamp();
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newRole.guild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newRole.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}

module.exports = RoleUpdate;
