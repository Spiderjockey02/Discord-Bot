import { Event, EgglordEmbed } from '../../structures';
import { APIEmbed, Colors, Events, Guild, JSONEncodable, Role } from 'discord.js';
import EgglordClient from '../../base/Egglord';

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
		client.logger.debug(`Role: ${newRole.name} has been updated in guild: ${newRole.guild.id}.`);

		// Check if event roleUpdate is for logging
		const moderationSettings = newRole.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		// role name change
		if (oldRole.name != newRole.name) {
			const embed = new EgglordEmbed(client, newRole.guild)
				.setDescription(client.languageManager.translate(newRole.guild, 'events/role:NAME_DESC', { ROLE: `${newRole}`, NAME: newRole.name }))
				.setColor(Colors.Orange)
				.setFooter({ text: client.languageManager.translate(newRole.guild, 'misc:ID', { ID: newRole.id }) })
				.setAuthor({ name: newRole.guild.name, iconURL: newRole.guild.iconURL() ?? undefined })
				.addFields(
					{ name: client.languageManager.translate(newRole.guild, 'misc:BEFORE'), value: oldRole.name },
					{ name: client.languageManager.translate(newRole.guild, 'misc:AFTER'), value: newRole.name },
				)
				.setTimestamp();
			this.sendEmbed(client, newRole.guild, embed, moderationSettings.loggingChannelId);
		}

		// role colour change
		if (oldRole.color != newRole.color) {
			const embed = new EgglordEmbed(client, newRole.guild)
				.setDescription(client.languageManager.translate(newRole.guild, 'events/role:COLOUR_DESC', { ROLE: `${newRole}`, COLOUR: newRole.color }))
				.setColor(Colors.Orange)
				.setFooter({ text: client.languageManager.translate(newRole.guild, 'misc:ID', { ID: newRole.id }) })
				.setAuthor({ name: newRole.guild.name, iconURL: newRole.guild.iconURL() ?? undefined })
				.addFields(
					{ name: client.languageManager.translate(newRole.guild, 'misc:BEFORE'), value: `${oldRole.color} ([${oldRole.hexColor}](https://www.color-hex.com/color/${oldRole.hexColor.slice(1)}))` },
					{ name: client.languageManager.translate(newRole.guild, 'misc:AFTER'), value: `${newRole.color} ([${newRole.hexColor}](https://www.color-hex.com/color/${newRole.hexColor.slice(1)}))` },
				)
				.setTimestamp();
			this.sendEmbed(client, newRole.guild, embed, moderationSettings.loggingChannelId);
		}

		// role permission change
		if (oldRole.permissions.bitfield != newRole.permissions.bitfield) {
			const embed = new EgglordEmbed(client, newRole.guild)
				.setDescription(client.languageManager.translate(newRole.guild, 'events/role:PERM_DESC', { ROLE: `${newRole}`, NAME: newRole.name, PERM: `${newRole.permissions.bitfield}` }))
				.setColor(Colors.Orange)
				.setFooter({ text: client.languageManager.translate(newRole.guild, 'misc:ID', { ID: newRole.id }) })
				.setAuthor({ name: newRole.guild.name, iconURL: newRole.guild.iconURL() ?? undefined })
				.addFields(
					{ name: client.languageManager.translate(newRole.guild, 'misc:BEFORE'), value:`${oldRole.permissions.bitfield}` },
					{ name: client.languageManager.translate(newRole.guild, 'misc:AFTER'), value: `${newRole.permissions.bitfield}` },
				)
				.setTimestamp();
			this.sendEmbed(client, newRole.guild, embed, moderationSettings.loggingChannelId);
		}
	}

	async sendEmbed(client: EgglordClient, guild: Guild, embed: JSONEncodable<APIEmbed>, loggingChannelId: string | null) {
		// Find channel and send message
		try {
			if (loggingChannelId == null || embed == undefined) return;
			const modChannel = await guild.channels.fetch(loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}

