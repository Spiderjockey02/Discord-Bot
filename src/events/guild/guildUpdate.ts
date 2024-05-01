import Event from 'src/structures/Event';
import { Events, Guild } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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

		// Get server settings / if no settings then return
		const settings = newGuild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildUpdate is for logging
		if (settings.ModLog && settings.ModLogEvents?.includes('GUILDUPDATE')) {
			let embed, updated = false;

			// Guild name change
			if (oldGuild.name != newGuild.name) {
				embed = new Embed(client, newGuild)
					.setDescription('**Server name changed**')
					.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() })
					.addFields({ name: 'Before:', value: oldGuild.name })
					.addFields({ name: 'After:', value: newGuild.name })
					.setTimestamp();
				await newGuild.updateGuild({ guildName: newGuild.name });
				settings.guildName = newGuild.name;
				updated = true;
			}

			// Server's boost level has changed
			if (oldGuild.premiumTier != newGuild.premiumTier) {
				embed = new Embed(client, newGuild)
					.setDescription(`**Server boost ${oldGuild.premiumTier < newGuild.premiumTier ? 'increased' : 'decreased'}**`)
					.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() })
					.addFields({ name: 'Before:', value: oldGuild.premiumTier })
					.addFields({ name: 'After:', value: newGuild.premiumTier })
					.setTimestamp();
				updated = true;
			}

			// Server has got a new banner
			if (!oldGuild.banner && newGuild.banner) {
				embed = new Embed(client, newGuild)
					.setDescription('**Server banner changed**')
					.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() })
					.addFields({ name: 'Before:', value: oldGuild.banner })
					.addFields({ name: 'After:', value: newGuild.banner })
					.setTimestamp();
				updated = true;
			}

			// Server has made a AFK channel
			if (!oldGuild.afkChannel && newGuild.afkChannel) {
				embed = new Embed(client, newGuild)
					.setDescription('**Server AFK channel changed**')
					.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() })
					.addFields({ name: 'Before:', value: oldGuild.afkChannel })
					.addFields({ name: 'After:', value: newGuild.afkChannel })
					.setTimestamp();
				updated = true;
			}

			// Server now has a vanity URL
			if (!oldGuild.vanityURLCode && newGuild.vanityURLCode) {
				embed = new Embed(client, newGuild)
					.setDescription('**Server Vanity URL changed**')
					.setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() })
					.addFields({ name: 'Before:', value: oldGuild.vanityURLCode })
					.addFields({ name: 'After:', value: newGuild.vanityURLCode })
					.setTimestamp();
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${newGuild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newGuild.id) client.addEmbed(modChannel.id, [embed]);
				} catch (err: any) {
					client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}
