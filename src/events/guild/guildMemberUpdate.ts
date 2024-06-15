import { Event, EgglordEmbed } from '../../structures';
import { Events, GuildMember } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Guild member update event
 * @event Egglord#GuildMemberUpdate
 * @extends {Event}
*/
export default class GuildMemberUpdate extends Event {
	constructor() {
		super({
			name: Events.GuildMemberUpdate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildMember} oldMember The member before the update
	 * @param {GuildMember} newMember The member after the update
	 * @readonly
	*/
	async run(client: EgglordClient, oldMember: GuildMember, newMember: GuildMember) {
		// For debugging
		client.logger.debug(`Member: ${newMember.user.displayName} has been updated in guild: ${newMember.guild.id}.`);
		if (oldMember.user.id == client.user.id) return;

		// if the oldMember is not cached ignore.
		if (oldMember.partial) return;

		// Check if event channelCreate is for logging
		const moderationSettings = newMember.guild.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;
		let embed, updated = false;

		// nickname change
		if (oldMember.nickname != newMember.nickname) {
			embed = new EgglordEmbed(client, newMember.guild)
				.setDescription(`**${newMember.toString()} nickname changed**`)
				.setFooter({ text: `ID: ${newMember.id}` })
				.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() })
				.addFields(
					{ name: 'Before:', value: `${oldMember.nickname || '*None*'}`, inline: true },
					{ name: 'After:', value: `${newMember.nickname || '*None*'}`, inline: true })
				.setTimestamp();
			updated = true;
		}

		// Look to see if user has boosted the server
		if (!oldMember.premiumSince && newMember.premiumSince) {
			embed = new EgglordEmbed(client, newMember.guild)
				.setDescription(`**${newMember.toString()} has boosted the server**`)
				.setFooter({ text: `ID: ${newMember.id}` })
				.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() })
				.setTimestamp();
			updated = true;
		}

		// Look to see if user has stopped boosted the server
		if (oldMember.premiumSince && !newMember.premiumSince) {
			embed = new EgglordEmbed(client, newMember.guild)
				.setDescription(`**${newMember.toString()} has unboosted the server**`)
				.setFooter({ text: `ID: ${newMember.id}` })
				.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() })
				.setTimestamp();
			updated = true;
		}

		// look for role change
		const rolesAdded = newMember.roles.cache.filter(x => !oldMember.roles.cache.get(x.id));
		const rolesRemoved = oldMember.roles.cache.filter(x => !newMember.roles.cache.get(x.id));
		if (rolesAdded.size != 0 || rolesRemoved.size != 0) {
			const roleAddedString = [];
			for (const role of [...rolesAdded.values()]) {
				roleAddedString.push(role.toString());
			}
			const roleRemovedString = [];
			for (const role of [...rolesRemoved.values()]) {
				roleRemovedString.push(role.toString());
			}
			embed = new EgglordEmbed(client, newMember.guild)
				.setDescription(`**${newMember.toString()} roles changed**`)
				.setFooter({ text: `ID: ${newMember.id}` })
				.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() })
				.addFields(
					{ name: `Added roles [${rolesAdded.size}]:`, value: `${roleAddedString.length == 0 ? '*None*' : roleAddedString.join('\n ')}`, inline: true },
					{ name: `Removed Roles [${rolesRemoved.size}]:`, value: `${roleRemovedString.length == 0 ? '*None*' : roleRemovedString.join('\n ')}`, inline: true })
				.setTimestamp();
			updated = true;
		}

		if (updated) {
			// Find channel and send message
			try {
				if (moderationSettings.loggingChannelId == null || embed == undefined) return;
				const modChannel = await newMember.guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
