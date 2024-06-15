import { BaseGuildTextChannel, Colors, Events, GuildMember } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event, EgglordEmbed } from '../../structures';
/**
 * Guild member remove event
 * @event Egglord#GuildMemberRemove
 * @extends {Event}
*/
export default class GuildMemberRemove extends Event {
	constructor() {
		super({
			name: Events.GuildMemberRemove,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildMember} member The member that has left/been kicked from a guild
	 * @readonly
	*/
	async run(client: EgglordClient, member: GuildMember) {
		// For debugging
		client.logger.debug(`Member: ${member.user.displayName} has left guild: ${member.guild.id}.`);
		if (member.user.id == client.user.id) return;

		// Check if event guildMemberRemove is for logging
		const moderationSettings = member.guild.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, member.guild)
			.setDescription(client.languageManager.translate(member.guild, 'events/guild:MEMBER_ADD_DESC', { COUNT: member.guild.memberCount, MEMBER: `${member}` }))
			.setColor(Colors.Red)
			.setFooter({ text: client.languageManager.translate(member.guild, 'misc:ID', { ID: member.id }) })
			.setThumbnail(member.user.displayAvatarURL())
			.setAuthor({ name: client.languageManager.translate(member.guild, 'events/guild:USER_LEFT'), iconURL: member.user.displayAvatarURL() })
			.addFields({ name: client.languageManager.translate(member.guild, 'events/guild:JOIN_AT'), value: member.partial ? 'Unknown' : `<t:${Math.round(member?.joinedTimestamp ?? 0 / 1000)}:R> (${Math.round((new Date().getTime() - (member.joinedAt?.getTime() ?? 0)) / 86400000)} day(s) ago)` })
			.setTimestamp();

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await member.guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}

		// Welcome plugin (give roles and message)
		const welcomeSettings = member.guild.settings?.welcomeSystem;
		if (welcomeSettings?.goodbyeEnabled && welcomeSettings.joinChannelId) {
			const channel = member.guild.channels.cache.get(welcomeSettings.joinChannelId) as BaseGuildTextChannel;
			channel.send(welcomeSettings.goodbyeText);
		}
	}
}

