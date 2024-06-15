import { Events, EmbedBuilder, AttachmentBuilder, Guild } from 'discord.js';
import { Event } from '../../structures';
import ImageManipulator from '../../helpers/ImageManipulator';
import EgglordClient from '../../base/Egglord';

/**
 * Guild create event
 * @event Egglord#GuildCreate
 * @extends {Event}
*/
export default class GuildCreate extends Event {
	constructor() {
		super({
			name: Events.GuildCreate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Guild} guild The guild that added the client
	 * @readonly
	*/
	async run(client: EgglordClient, guild: Guild) {
		// LOG server Join
		client.logger.log(`[GUILD JOIN] ${guild.name} (${guild.id}) added the client.`);

		// Apply server settings
		try {
			// Create guild settings and fetch cache.
			await guild.fetchSettings();
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}

		// Send message to channel that client has joined a server
		const owner = await guild.members.fetch(guild.ownerId);
		const embed = new EmbedBuilder()
			.setTitle(`[GUILD JOIN] ${guild.name}`);
		let attachment;
		if (guild.icon == null) {
			const icon = await ImageManipulator.guildIcon(guild.name, 128);
			attachment = new AttachmentBuilder(icon, { name: 'guildicon.png' });
			embed.setImage('attachment://guildicon.png');
		} else {
			embed.setImage(guild.iconURL({ size: 1024 }));
		}
		embed.setDescription([
			`Guild ID: ${guild.id ?? 'undefined'}`,
			`Owner: ${owner.user.displayName}`,
			`MemberCount: ${guild.memberCount ?? 'undefined'}`,
		].join('\n'));

		// Find channel and send message
		const modChannel = await client.channels.fetch(client.config.SupportServer.GuildChannel).catch(() => client.logger.error(`Error fetching guild: ${guild.id} logging channel`));
		if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed, attachment]);
	}
}
