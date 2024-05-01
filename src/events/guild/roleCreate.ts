import Event from 'src/structures/Event';
import { Events, Role } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

/**
 * Role create event
 * @event Egglord#RoleCreate
 * @extends {Event}
*/
export default class RoleCreate extends Event {
	constructor() {
		super({
			name: Events.GuildRoleCreate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Role} role The role that was created
	 * @readonly
	*/
	async run(client: EgglordClient, role: Role) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Role: ${role.name} has been created in guild: ${role.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = role.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event roleCreate is for logging
		if (settings.ModLogEvents?.includes('ROLECREATE') && settings.ModLog) {
			const embed = new Embed(client, role.guild)
				.setDescription(`**Role: ${role} (${role.name}) was created**`)
				.setColor(3066993)
				.setFooter({ text: `ID: ${role.id}` })
				.setAuthor({ name: role.guild.name, iconURL: role.guild.iconURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${role.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == role.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
