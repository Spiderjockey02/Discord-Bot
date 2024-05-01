import Event from 'src/structures/Event';
import { Events, Message, Role } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

/**
 * Role update event
 * @event Egglord#RoleUpdate
 * @extends {Event}
*/
export default class RoleUpdate extends Event {
	constructor() {
		super({
			name: Events.GuildRoleUpdate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Role} oldRole The role before the update
	 * @param {Role} newRole The role after the update
	 * @readonly
	*/
	async run(client: EgglordClient, oldRole: Role, newRole: Role) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Role: ${newRole.name} has been updated in guild: ${newRole.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = newRole.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event roleUpdate is for logging
		if (settings.ModLogEvents?.includes('ROLEUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// role name change
			if (oldRole.name != newRole.name) {
				embed = new Embed(client, newRole.guild)
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
				embed = new Embed(client, newRole.guild)
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
				embed = new Embed(client, newRole.guild)
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
					const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${newRole.guild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newRole.guild.id) client.addEmbed(modChannel.id, [embed]);
				} catch (err: any) {
					client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}

