import { Event } from '../../structures';
import { Events, Guild } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

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
		if (client.config.debug) client.logger.debug(`Guild: ${newGuild.name} has been updated.`);

		// Check if event guildUpdate is for logging
		const moderationSettings = newGuild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			let embed, updated = false;

			// Guild name change
			if (oldGuild.name != newGuild.name) {
				embed = new EgglordEmbed(client, newGuild)
					.setDescription('**Server name changed**')
					.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() ?? undefined })
					.addFields({ name: 'Before:', value: oldGuild.name })
					.addFields({ name: 'After:', value: newGuild.name })
					.setTimestamp();
				updated = true;
			}

			// Server's boost level has changed
			if (oldGuild.premiumTier != newGuild.premiumTier) {
				embed = new EgglordEmbed(client, newGuild)
					.setDescription(`**Server boost ${oldGuild.premiumTier < newGuild.premiumTier ? 'increased' : 'decreased'}**`)
					.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() ?? undefined })
					.addFields({ name: 'Before:', value: `${oldGuild.premiumTier}` }, { name: 'After:', value: `${newGuild.premiumTier}` })
					.setTimestamp();
				updated = true;
			}

			// Server has got a new banner
			if (oldGuild.banner != newGuild.banner) {
				embed = new EgglordEmbed(client, newGuild)
					.setDescription('**Server banner changed**')
					.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() ?? undefined })
					.addFields({ name: 'Before:', value: oldGuild.banner ?? '' }, { name: 'After:', value: newGuild.banner ?? '' })
					.setTimestamp();
				updated = true;
			}

			// Server has made a AFK channel
			if (oldGuild.afkChannel != newGuild.afkChannel) {
				embed = new EgglordEmbed(client, newGuild)
					.setDescription('**Server AFK channel changed**')
					.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() ?? undefined })
					.addFields({ name: 'Before:', value: `${oldGuild.afkChannel}` }, { name: 'After:', value: `${newGuild.afkChannel}` })
					.setTimestamp();
				updated = true;
			}

			// Server now has a vanity URL
			if (oldGuild.vanityURLCode != newGuild.vanityURLCode) {
				embed = new EgglordEmbed(client, newGuild)
					.setDescription('**Server Vanity URL changed**')
					.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() ?? undefined })
					.addFields({ name: 'Before:', value: `${oldGuild.vanityURLCode}` }, { name: 'After:', value: `${newGuild.vanityURLCode}` })
					.setTimestamp();
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					if (moderationSettings.loggingChannelId == null || embed == undefined) return;
					const modChannel = await newGuild.channels.fetch(moderationSettings.loggingChannelId);
					if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
				} catch (err: any) {
					client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}
