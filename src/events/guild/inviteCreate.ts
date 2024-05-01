import Event from 'src/structures/Event';
import { Events, Invite } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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
		if (client.config.debug) client.logger.debug(`Invite has been created in ${invite.channel ? `channel: ${invite.channel.id}` : `guild: ${invite.guild.id}`}.`);

		// Get server settings / if no settings then return
		const settings = invite.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberAdd is for logging
		if (settings.ModLogEvents?.includes('INVITECREATE') && settings.ModLog) {
			const embed = new Embed(client, invite.guild)
				.setDescription([
					`Invite created ${invite.channel ? `in channel: ${invite.channel}` : ''}`,
					`Code: \`${invite.code}\`.`,
					`Max uses: \`${invite.maxUses == 0 ? 'Infinity' : invite.maxUses}\`.`,
					`Runs out: ${invite.maxAge != 0 ? `<t:${Math.round((new Date().getTime() / 1000)) + invite.maxAge}:R>` : 'never'}.`,
					`Temporary: \`${invite.temporary ? 'Yes' : 'No'}\``,
				].join('\n'))
				.setColor(3066993)
				.setFooter({ text: `ID: ${invite.inviter.id}` })
				.setAuthor({ name: 'Invite created:', iconURL: invite.inviter.displayAvatarURL() })
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