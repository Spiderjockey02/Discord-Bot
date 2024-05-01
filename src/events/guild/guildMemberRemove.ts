import { Events, GuildMember } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';
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

		// Get server settings / if no settings then return
		const settings = member.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberRemove is for logging
		if (settings.ModLogEvents?.includes('GUILDMEMBERREMOVE') && settings.ModLog) {
			const embed = new Embed(client, member.guild)
				.setDescription(`${member.toString()}\nMember count: ${member.guild.memberCount}`)
				.setColor(15158332)
				.setFooter({ text: `ID: ${member.id}` })
				.setThumbnail(member.user.displayAvatarURL())
				.setAuthor({ name: 'User left:', iconURL: member.user.displayAvatarURL() })
				.addFields({ name: 'Joined at:', value: member.partial ? 'Unknown' : `<t:${Math.round(member.joinedTimestamp / 1000)}:R> (${Math.round((new Date() - member.joinedAt) / 86400000)} day(s) ago)` })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${member.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == member.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}

		// Welcome plugin (give roles and message)
		if (settings.welcomePlugin) {
			const channel = member.guild.channels.cache.get(settings.welcomeMessageChannel);
			if (channel && settings.welcomeGoodbyeToggle) channel.send(varSetter(settings.welcomeGoodbyeText, member, channel, member.guild)).catch(e => client.logger.error(e.message));
		}

		// Remove member's rank
		try {
			await RankSchema.findOneAndRemove({ userID: member.user.id,	guildID: member.guild.id });
		} catch (err: any) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}
	}
}

