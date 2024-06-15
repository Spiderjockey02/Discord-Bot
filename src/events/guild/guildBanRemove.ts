import { Colors, Events, GuildBan } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event, EgglordEmbed } from '../../structures';

/**
 * Guild ban remove event
 * @event Egglord#GuildBanRemove
 * @extends {Event}
*/
export default class GuildBanRemove extends Event {
	constructor() {
		super({
			name: Events.GuildBanRemove,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildBan} guildBan The ban that was removed
	 * @readonly
	*/
	async run(client: EgglordClient, guildBan: GuildBan) {
		const { guild, user } = guildBan;

		// Make sure all relevant data is fetched
		try {
			if (guildBan.user.partial) await guildBan.user.fetch();
		} catch (err: any) {
			if (['Missing Permissions', 'Missing Access'].includes(err.message)) return;
			return client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// For debugging
		client.logger.debug(`Member: ${user.displayName} has been unbanned in guild: ${guild.id}.`);

		// Check if event guildBanRemove is for logging
		const moderationSettings = guild.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;
		const embed = new EgglordEmbed(client, guild)
			.setDescription(client.languageManager.translate(guild, 'events/guild:USER', { USER: `${user}` }))
			.setColor(Colors.Red)
			.setAuthor({ name: client.languageManager.translate(guild, 'events/guild:USER_UNBAN'), iconURL: user.displayAvatarURL() })
			.setThumbnail(user.displayAvatarURL())
			.setTimestamp()
			.setFooter({ text: client.languageManager.translate(guild, 'misc:ID', { ID: user.id }) });

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel && modChannel.guild.id == guild.id) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}

}