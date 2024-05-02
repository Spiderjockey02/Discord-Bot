import { BaseGuildTextChannel, Events, GuildMember } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event } from '../../structures';
import { EgglordEmbed } from '../../utils';
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
		if (client.config.debug) client.logger.debug(`Member: ${member.user.displayName} has left guild: ${member.guild.id}.`);
		if (member.user.id == client.user.id) return;

		// Check if event guildMemberRemove is for logging
		const moderationSettings = member.guild.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, member.guild)
				.setDescription(`${member.toString()}\nMember count: ${member.guild.memberCount}`)
				.setColor(15158332)
				.setFooter({ text: `ID: ${member.id}` })
				.setThumbnail(member.user.displayAvatarURL())
				.setAuthor({ name: 'User left:', iconURL: member.user.displayAvatarURL() })
				.addFields({ name: 'Joined at:', value: member.partial ? 'Unknown' : `<t:${Math.round(member?.joinedTimestamp ?? 0 / 1000)}:R> (${Math.round((new Date().getTime() - (member.joinedAt?.getTime() ?? 0)) / 86400000)} day(s) ago)` })
				.setTimestamp();

			// Find channel and send message
			try {
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await member.guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}

		// Welcome plugin (give roles and message)
		const welcomeSettings = member.guild.settings?.welcomeSystem;
		if (welcomeSettings?.goodbyeEnabled && welcomeSettings.joinChannelId) {
			const channel = member.guild.channels.cache.get(welcomeSettings.joinChannelId) as BaseGuildTextChannel;
			channel.send(welcomeSettings.goodbyeText);
		}
	}
}

