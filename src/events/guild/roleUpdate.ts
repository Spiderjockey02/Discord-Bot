import { Event } from '../../structures';
import { Events, Role } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

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

		// Check if event roleUpdate is for logging
		const moderationSettings = newRole.guild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			let embed, updated = false;

			// role name change
			if (oldRole.name != newRole.name) {
				embed = new EgglordEmbed(client, newRole.guild)
					.setDescription(`**Role name of ${newRole} (${newRole.name}) changed**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newRole.id}` })
					.setAuthor({ name: newRole.guild.name, iconURL: newRole.guild.iconURL() ?? undefined })
					.addFields(
						{ name: 'Before:', value: oldRole.name },
						{ name: 'After:', value: newRole.name },
					)
					.setTimestamp();
				updated = true;
			}

			// role colour change
			if (oldRole.color != newRole.color) {
				embed = new EgglordEmbed(client, newRole.guild)
					.setDescription(`**Role name of ${newRole} (${newRole.name}) changed**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newRole.id}` })
					.setAuthor({ name: newRole.guild.name, iconURL: newRole.guild.iconURL() ?? undefined })
					.addFields(
						{ name: 'Before:', value: `${oldRole.color} ([${oldRole.hexColor}](https://www.color-hex.com/color/${oldRole.hexColor.slice(1)}))` },
						{ name: 'After:', value: `${newRole.color} ([${newRole.hexColor}](https://www.color-hex.com/color/${newRole.hexColor.slice(1)}))` },
					)
					.setTimestamp();
				updated = true;
			}

			// role permission change
			if (oldRole.permissions.bitfield != newRole.permissions.bitfield) {
				embed = new EgglordEmbed(client, newRole.guild)
					.setDescription(`**Role permissions of ${newRole} (${newRole.name}) changed**\n[What those numbers mean](https://discordapi.com/permissions.html#${oldRole.permissions.bitfield})`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newRole.id}` })
					.setAuthor({ name: newRole.guild.name, iconURL: newRole.guild.iconURL() ?? undefined })
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
					if (moderationSettings.loggingChannelId == null || embed == undefined) return;
					const modChannel = await newRole.guild.channels.fetch(moderationSettings.loggingChannelId);
					if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
				} catch (err: any) {
					client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}

