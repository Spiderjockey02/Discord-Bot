import { Event, EgglordEmbed } from '../../structures';
import { APIEmbed, Events, Guild, JSONEncodable } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Guild update event
 * @event Egglord#GuildUpdate
 * @extends {Event}
*/
export default class GuildUpdate extends Event {
	constructor() {
		super({
			name: Events.GuildUpdate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Guild} oldGuild The guild before the update
	 * @param {Guild} newGuild The guild after the update
	 * @readonly
	*/
	async run(client: EgglordClient, oldGuild: Guild, newGuild: Guild) {
		// For debugging
		client.logger.debug(`Guild: ${newGuild.name} has been updated.`);

		// Check if event guildUpdate is for logging
		const moderationSettings = newGuild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		// Guild name change
		if (oldGuild.name != newGuild.name) {
			const embed = new EgglordEmbed(client, newGuild)
				.setDescription(client.languageManager.translate(newGuild, 'events/guild:NAME_DESC'))
				.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() ?? undefined })
				.addFields({ name: client.languageManager.translate(newGuild, 'misc:BEFORE'), value: oldGuild.name })
				.addFields({ name: client.languageManager.translate(newGuild, 'misc:AFTER'), value: newGuild.name })
				.setTimestamp();
			this.sendEmbed(client, newGuild, embed, moderationSettings.loggingChannelId);
		}

		// Server's boost level has changed
		if (oldGuild.premiumTier != newGuild.premiumTier) {
			const embed = new EgglordEmbed(client, newGuild)
				.setDescription(client.languageManager.translate(newGuild, `events/guild:${oldGuild.premiumTier < newGuild.premiumTier ? 'INCR' : 'DECRE'}_BOOSTER_DESC`))
				.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() ?? undefined })
				.addFields({ name: client.languageManager.translate(newGuild, 'misc:BEFORE'), value: `${oldGuild.premiumTier}` })
				.addFields({ name: client.languageManager.translate(newGuild, 'misc:AFTER'), value: `${newGuild.premiumTier}` })
				.setTimestamp();
			this.sendEmbed(client, newGuild, embed, moderationSettings.loggingChannelId);
		}

		// Server has got a new banner
		if (oldGuild.banner != newGuild.banner) {
			const embed = new EgglordEmbed(client, newGuild)
				.setDescription(client.languageManager.translate(newGuild, 'events/guild:BANNER_DESC'))
				.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() ?? undefined })
				.addFields({ name: client.languageManager.translate(newGuild, 'misc:BEFORE'), value: oldGuild.banner ?? '' })
				.addFields({ name: client.languageManager.translate(newGuild, 'misc:AFTER'), value: newGuild.banner ?? '' })
				.setTimestamp();
			this.sendEmbed(client, newGuild, embed, moderationSettings.loggingChannelId);
		}

		// Server has made a AFK channel
		if (oldGuild.afkChannel != newGuild.afkChannel) {
			const embed = new EgglordEmbed(client, newGuild)
				.setDescription(client.languageManager.translate(newGuild, 'events/guild:AFK_DESC'))
				.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() ?? undefined })
				.addFields({ name: client.languageManager.translate(newGuild, 'misc:BEFORE'), value: `${oldGuild.afkChannel}` })
				.addFields({ name: client.languageManager.translate(newGuild, 'misc:AFTER'), value: `${newGuild.afkChannel}` })
				.setTimestamp();
			this.sendEmbed(client, newGuild, embed, moderationSettings.loggingChannelId);
		}

		// Server now has a vanity URL
		if (oldGuild.vanityURLCode != newGuild.vanityURLCode) {
			const embed = new EgglordEmbed(client, newGuild)
				.setDescription(client.languageManager.translate(newGuild, 'events/guild:VANITY_DESC'))
				.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() ?? undefined })
				.addFields({ name: client.languageManager.translate(newGuild, 'misc:BEFORE'), value: `${oldGuild.vanityURLCode}` })
				.addFields({ name: client.languageManager.translate(newGuild, 'misc:AFTER'), value: `${newGuild.vanityURLCode}` })
				.setTimestamp();
			this.sendEmbed(client, newGuild, embed, moderationSettings.loggingChannelId);
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
