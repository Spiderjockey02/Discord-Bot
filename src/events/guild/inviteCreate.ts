import { Event, EgglordEmbed } from '../../structures';
import { Colors, Events, Invite, InviteGuild } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Invite create event
 * @event Egglord#InviteCreate
 * @extends {Event}
*/
export default class InviteCreate extends Event {
	constructor() {
		super({
			name: Events.InviteCreate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Invite} invite The invite that was created
	 * @readonly
	*/
	async run(client: EgglordClient, invite: Invite) {
		// For debugging
		client.logger.debug(`Invite has been created in ${invite.channel ? `channel: ${invite.channel.id}` : `guild: ${invite.guild?.id}`}.`);

		// Return if some sort uncached guild
		if (invite.guild instanceof InviteGuild) return;

		// Check if event guildMemberAdd is for logging
		const moderationSettings = invite.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, invite.guild)
			.setDescription([
				`Invite created ${invite.channel ? `in channel: ${invite.channel}` : ''}`,
				`Code: \`${invite.code}\`.`,
				`Max uses: \`${invite.maxUses == 0 ? 'Infinity' : invite.maxUses}\`.`,
				`Runs out: ${invite.maxAge != 0 ? `<t:${Math.round((new Date().getTime() / 1000)) + (invite.maxAge ?? 0)}:R>` : 'never'}.`,
				`Temporary: \`${invite.temporary ? 'Yes' : 'No'}\``,
			].join('\n'))
			.setColor(Colors.Green)
			.setFooter({ text: client.languageManager.translate(invite.guild, 'misc:ID', { ID: `${invite.inviter?.id}` }) })
			.setAuthor({ name: 'Invite created:', iconURL: invite.inviter?.displayAvatarURL() })
			.setTimestamp();

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null || invite.guild instanceof InviteGuild) return;
			const modChannel = await invite.guild?.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}