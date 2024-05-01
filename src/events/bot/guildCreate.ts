// Dependencies
import { Events, EmbedBuilder, AttachmentBuilder, ActivityType, Guild } from 'discord.js';
import Event from 'src/structures/Event';
import { Canvas } from 'canvacord';
import EgglordClient from 'src/base/Egglord';

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
		} catch (err: any) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Send message to channel that client has joined a server
		const owner = await guild.members.fetch(guild.ownerId);
		const embed = new EmbedBuilder()
			.setTitle(`[GUILD JOIN] ${guild.name}`);
		let attachment;
		if (guild.icon == null) {
			const icon = await Canvas.guildIcon(guild.name, 128);
			attachment = new AttachmentBuilder(icon, { name: 'guildicon.png' });
			embed.setImage('attachment://guildicon.png');
		} else {
			embed.setImage(guild.iconURL({ dynamic: true, size: 1024 }));
		}
		embed.setDescription([
			`Guild ID: ${guild.id ?? 'undefined'}`,
			`Owner: ${owner.user.displayName}`,
			`MemberCount: ${guild.memberCount ?? 'undefined'}`,
		].join('\n'));

		// Find channel and send message
		const modChannel = await client.channels.fetch(client.config.supportServer.channelId).catch(() => client.logger.error(`Error fetching guild: ${guild.id} logging channel`));
		if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed, attachment]);

		// update client's activity
		client.SetActivity(ActivityType.Watching, [`${client.guilds.cache.size} servers!`, `${client.users.cache.size} users!`]);

		// get slash commands for category
		const enabledPlugins = guild.settings.plugins;
		const data = [];
		for (const plugin of enabledPlugins) {
			const g = await client.loadInteractionGroup(plugin, guild);
			if (Array.isArray(g)) data.push(...g);
		}

		// upload slash commands to guild
		try {
			await client.guilds.cache.get(guild.id)?.commands.set(data);
			client.logger.log('Loaded Interactions for guild: ' + guild.name);
		} catch (err: any) {
			client.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
		}
	}
}
