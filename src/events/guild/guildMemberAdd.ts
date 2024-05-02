import { Event } from '../../structures';
import { BaseGuildTextChannel, Events, GuildMember } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

/**
 * Guild member add event
 * @event Egglord#GuildMemberAdd
 * @extends {Event}
*/
export default class GuildMemberAdd extends Event {
	constructor() {
		super({
			name: Events.GuildMemberAdd,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildMember} member The member that has joined a guild
	 * @readonly
	*/
	async run(client: EgglordClient, member: GuildMember) {
	// For debugging
		if (client.config.debug) client.logger.debug(`Member: ${member.user.displayName} has joined guild: ${member.guild.id}.`);
		if (member.user.id == client.user.id) return;

		// Check if event guildMemberAdd is for logging
		const moderationSettings = member.guild.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, member.guild)
				.setDescription(`${member}\nMember count: ${member.guild.memberCount}`)
				.setColor(3066993)
				.setFooter({ text: `ID: ${member.id}` })
				.setThumbnail(member.user.displayAvatarURL())
				.setAuthor({ name: 'User joined:', iconURL: member.user.displayAvatarURL() })
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
		if (welcomeSettings) {
			// Send welcome message to new user
			if (welcomeSettings.joinMessageEnabled && welcomeSettings.joinChannelId) {
				const welcomeChannel = member.guild.channels.cache.get(welcomeSettings.joinChannelId) as BaseGuildTextChannel;
				welcomeChannel.send(welcomeSettings.joinMessageText);
			}

			// Send DM to new user
			if (welcomeSettings.joinPrivateEnabled) {
				member.send(welcomeSettings.joinPrivateText);
			}

			// Add roles to new user
			if (welcomeSettings.joinRolesGive.length > 0) {
				member.roles.add(welcomeSettings.joinRolesGive.map(i => i.id));
			}
		}
	}
}
