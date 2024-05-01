import Event from 'src/structures/Event';
import { Events, GuildBan } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

/**
 * Guild ban add event
 * @event Egglord#GuildBanAdd
 * @extends {Event}
	*/
export default class GuildBanAdd extends Event {
	constructor() {
		super({
			name: Events.GuildBanAdd,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildBan} ban The ban that occurred
	 * @readonly
	*/
	async run(client: EgglordClient, guildBan: GuildBan) {
		const { guild, user } = guildBan;

		// Make sure all relevant data is fetched
		try {
			if (guildBan.partial) await guildBan.fetch();
			if (guildBan.user.partial) await guildBan.user.fetch();
		} catch (err: any) {
			if (['Missing Permissions', 'Missing Access'].includes(err.message)) return;
			return client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// For debugging
		if (client.config.debug) client.logger.debug(`Member: ${user.displayName} has been banned in guild: ${guild.id}.`);

		// Get server settings / if no settings then return
		const settings = guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildBanAdd is for logging
		if (settings.ModLogEvents?.includes('GUILDBANADD') && settings.ModLog) {
			const embed = new Embed(client, guild)
				.setDescription(`User: ${user.toString()}`)
				.setColor(15158332)
				.setAuthor({ name: 'User banned:', iconURL: user.displayAvatarURL() })
				.setThumbnail(user.displayAvatarURL())
				.addFields({ name: 'Reason:', value: guildBan.reason ?? 'No reason given' })
				.setTimestamp()
				.setFooter({ text: `ID: ${user.id}` });

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

