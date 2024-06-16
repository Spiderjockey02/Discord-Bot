import { Event } from '../../structures';
import { EmbedBuilder, AttachmentBuilder, Events, Guild } from 'discord.js';
import ImageManipulator from '../../helpers/ImageManipulator';
import EgglordClient from '../../base/Egglord';

/**
 * Guild delete event
 * @event Egglord#GuildDelete
 * @extends {Event}
*/
export default class GuildDelete extends Event {
	constructor() {
		super({
			name: Events.GuildDelete,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Guild} guild The guild that kicked the client
	 * @readonly
	*/
	async run(client: EgglordClient, guild: Guild) {
		if (!client.isReady() && !guild.available) return;
		client.logger.log(`[GUILD LEAVE] ${guild.name} (${guild.id}) removed the client.`);

		// Send message to channel that client has left a server
		let attachment;
		try {
			const embed = new EmbedBuilder()
				.setTitle(`[GUILD LEAVE] ${guild.name}`);
			if (guild.icon == null) {
				const icon = await ImageManipulator.guildIcon(guild.name ?? 'undefined', 128);
				attachment = new AttachmentBuilder(icon, { name: 'guildicon.png' });
				embed.setImage('attachment://guildicon.png');
			} else {
				embed.setImage(guild.iconURL({ size: 1024 }));
			}
			embed.setDescription([
				`Guild ID: ${guild.id ?? 'undefined'}`,
				`Owner: ${client.users.cache.get(guild.ownerId)?.tag}`,
				`MemberCount: ${guild?.memberCount ?? 'undefined'}`,
			].join('\n'));

			const modChannel = await client.channels.fetch(client.config.SupportServer.GuildChannel).catch(() => client.logger.error(`Error fetching guild: ${guild.id} logging channel`));
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed, attachment]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}