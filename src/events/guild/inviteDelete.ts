import { Events, Guild, Invite, InviteGuild } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event } from '../../structures';
import { EgglordEmbed } from '../../utils';

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
		// Check if event guildMemberAdd is for logging
		const moderationSettings = invite.guild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, invite.guild as Guild)
				.setDescription('**Invite Deleted**')
				.setColor(15158332)
				.setFooter({ text: `Guild ID: ${invite.guild?.id}` })
				.setTimestamp();

			// Find channel and send message
			try {
				if (invite.guild instanceof InviteGuild) return;
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await invite.guild?.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

