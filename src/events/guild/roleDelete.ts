import { Event, EgglordEmbed } from '../../structures';
import { Colors, Events, Role } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Role delete event
 * @event Egglord#RoleDelete
 * @extends {Event}
*/
export default class RoleDelete extends Event {
	constructor() {
		super({
			name: Events.GuildRoleDelete,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Role} role The role that was deleted
	 * @readonly
	*/
	async run(client: EgglordClient, role: Role) {
		// For debugging
		client.logger.debug(`Role: ${role.name} has been deleted in guild: ${role.guild.id}.`);

		const moderationSettings = role.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, role.guild)
			.setDescription(client.languageManager.translate(role.guild, 'events/role:DELETE_DESC', { ROLE: `${role}`, NAME: role.name }))
			.setColor(Colors.Red)
			.setFooter({ text: client.languageManager.translate(role.guild, 'misc:ID', { ID: role.id }) })
			.setAuthor({ name: role.guild.name, iconURL: role.guild.iconURL() ?? undefined })
			.setTimestamp();

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await role.guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}
