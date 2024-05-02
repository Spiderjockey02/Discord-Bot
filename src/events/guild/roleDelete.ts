import { Event } from '../../structures';
import { Events, Role } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

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
		if (client.config.debug) client.logger.debug(`Role: ${role.name} has been deleted in guild: ${role.guild.id}.`);


		const moderationSettings = role.guild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, role.guild)
				.setDescription(`**Role: ${role} (${role.name}) was deleted**`)
				.setColor(15158332)
				.setFooter({ text: `ID: ${role.id}` })
				.setAuthor({ name: role.guild.name, iconURL: role.guild.iconURL() ?? undefined })
				.setTimestamp();

			// Find channel and send message
			try {
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await role.guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
