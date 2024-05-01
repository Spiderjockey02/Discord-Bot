import { Events, Invite } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Invite delete event
 * @event Egglord#InviteDelete
 * @extends {Event}
*/
export default class InviteDelete extends Event {
	constructor() {
		super({
			name: Events.InviteDelete,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Invite} invite The invite that was deleted
	 * @readonly
	*/
	async run(client: EgglordClient, invite: Invite) {
		// Get server settings / if no settings then return
		const settings = invite.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberAdd is for logging
		if (settings.ModLogEvents?.includes('INVITEDELETE') && settings.ModLog) {
			const embed = new Embed(client, invite.guild)
				.setDescription('**Invite Deleted**')
				.setColor(15158332)
				.setFooter({ text: `Guild ID: ${invite.guild.id}` })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${invite.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == invite.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

