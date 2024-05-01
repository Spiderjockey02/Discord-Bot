import Event from 'src/structures/Event';
import { Events, GuildMember } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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

		// Get server settings / if no settings then return
		const settings = member.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberAdd is for logging
		if (settings.ModLogEvents?.includes('GUILDMEMBERADD') && settings.ModLog) {
			const embed = new Embed(client, member.guild)
				.setDescription(`${member}\nMember count: ${member.guild.memberCount}`)
				.setColor(3066993)
				.setFooter({ text: `ID: ${member.id}` })
				.setThumbnail(member.user.displayAvatarURL())
				.setAuthor({ name: 'User joined:', iconURL: member.user.displayAvatarURL() })
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
			if (channel) channel.send(varSetter(settings.welcomeMessageText, member, channel, member.guild)).catch(e => client.logger.error(e.message));
			// Send private message to user
			if (settings.welcomePrivateToggle) member.send(settings.welcomePrivateText.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => client.logger.error(e.message));

			// Add role to user
			try {
				if (settings.welcomeRoleToggle) await member.roles.add(settings.welcomeRoleGive);
			} catch (err: any) {
				console.log(settings.welcomeRoleGive);
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
