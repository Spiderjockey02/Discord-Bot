import { Event, EgglordEmbed } from '../../structures';
import { APIEmbed, BaseGuildTextChannel, BaseGuildVoiceChannel, ChannelType, Colors, DMChannel, Events, Guild, GuildChannel, JSONEncodable, OverwriteType } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Channel update event
 * @event Egglord#ChannelDelete
 * @extends {Event}
*/
export default class ChannelUpdate extends Event {
	constructor() {
		super({
			name: Events.ChannelUpdate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildChannel|DMChannel} oldChannel The channel before the update
	 * @param {GuildChannel|DMChannel} newChannel The channel after the update
	 * @readonly
	*/
	async run(client: EgglordClient, oldChannel: DMChannel | GuildChannel, newChannel: DMChannel | GuildChannel) {
		// For debugging
		client.logger.debug(`Channel: ${newChannel.type == ChannelType.DM ? newChannel.recipient?.displayName : newChannel.name} has been updated${newChannel.type == ChannelType.DM ? '' : ` in guild: ${newChannel.guild.id}`}. (${ChannelType[newChannel.type]})`);

		// Ignore if a DM channel
		if (newChannel.type == ChannelType.DM || oldChannel.type == ChannelType.DM) return;

		// Check if event channelDelete is for logging
		const moderationSettings = newChannel.guild.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		// Channel name change
		if (oldChannel.name != newChannel.name) {
			const embed = new EgglordEmbed(client, newChannel.guild)
				.setDescription(`**${newChannel.type === ChannelType.GuildCategory ? 'Category' : 'Channel'} name changed of ${newChannel.toString()}**`)
				.setColor(Colors.Orange)
				.setFooter({ text: `ID: ${newChannel.id}` })
				.setAuthor({ name: newChannel.guild.name, iconURL: newChannel.guild.iconURL() ?? '' })
				.addFields(
					{ name: 'Old:', value: `${oldChannel.name}`, inline: true },
					{ name: 'New:', value: `${newChannel.name}`, inline: true },
				)
				.setTimestamp();

			this.sendEmbed(client, newChannel.guild, embed, moderationSettings.loggingChannelId);
		}

		// channel topic (description) change
		if (oldChannel instanceof BaseGuildTextChannel && newChannel instanceof BaseGuildTextChannel) {
			if (oldChannel.topic != newChannel.topic) {
				const embed = new EgglordEmbed(client, newChannel.guild)
					.setDescription(`**${newChannel.type === ChannelType.GuildCategory ? 'Category' : 'Channel'} topic changed of ${newChannel.toString()}**`)
					.setColor(Colors.Orange)
					.setFooter({ text: `ID: ${newChannel.id}` })
					.setAuthor({ name: newChannel.guild.name, iconURL: newChannel.guild.iconURL() ?? '' })
					.addFields(
						{ name: 'Old:', value: `${oldChannel.topic ? oldChannel.topic : '*empty topic*'}`, inline: true },
						{ name: 'New:', value: `${newChannel.topic ? newChannel.topic : '*empty topic*'}`, inline: true },
					)
					.setTimestamp();

				this.sendEmbed(client, newChannel.guild, embed, moderationSettings.loggingChannelId);
			}
		}

		if (oldChannel instanceof BaseGuildVoiceChannel && newChannel instanceof BaseGuildVoiceChannel) {
			if (oldChannel.rtcRegion != newChannel.rtcRegion) {
				const embed = new EgglordEmbed(client, newChannel.guild)
					.setDescription(`**${newChannel.type === ChannelType.GuildCategory ? 'Category' : 'Channel'} region changed of ${newChannel.toString()}**`)
					.setColor(Colors.Orange)
					.setFooter({ text: `ID: ${newChannel.id}` })
					.setAuthor({ name: newChannel.guild.name, iconURL: newChannel.guild.iconURL() ?? undefined })
					.addFields(
						{ name: 'Old:', value: `${oldChannel.rtcRegion}`, inline: true },
						{ name: 'New:', value: `${newChannel.rtcRegion}`, inline: true },
					)
					.setTimestamp();

				this.sendEmbed(client, newChannel.guild, embed, moderationSettings.loggingChannelId);
			}
		}

		// Check for permission change
		const permDiff = oldChannel.permissionOverwrites.cache.filter(x => {
			if (newChannel.permissionOverwrites.cache.find(y => y.allow.bitfield == x.allow.bitfield) && newChannel.permissionOverwrites.cache.find(y => y.deny.bitfield == x.deny.bitfield)) {
				return false;
			}
			return true;
		}).concat(newChannel.permissionOverwrites.cache.filter(x => {
			if (oldChannel.permissionOverwrites.cache.find(y => y.allow.bitfield == x.allow.bitfield) && oldChannel.permissionOverwrites.cache.find(y => y.deny.bitfield == x.deny.bitfield)) {
				return false;
			}
			return true;
		}));

		if (permDiff.size) {
			const embed = new EgglordEmbed(client, newChannel.guild)
				.setDescription(`**${newChannel.type === ChannelType.GuildCategory ? 'Category' : 'Channel'} permissions changed of ${newChannel.toString()}**\n*note:* check [docs](https://discordapp.com/developers/docs/topics/permissions) to see what the numbers mean`)
				.setColor(Colors.Orange)
				.setFooter({ text: `ID: ${newChannel.id}` })
				.setAuthor({ name: newChannel.guild.name, iconURL: newChannel.guild.iconURL() ?? undefined })
				.setTimestamp();
			for (const permID of permDiff.keys()) {
				// load clienth overwrites into variables
				const oldPerm = oldChannel.permissionOverwrites.cache.get(permID);
				const newPerm = newChannel.permissionOverwrites.cache.get(permID);
				const oldBitfields = {
					allowed: oldPerm?.allow ? oldPerm.allow.bitfield : 0,
					denied: oldPerm?.deny ? oldPerm.deny.bitfield : 0,
				};
				const newBitfields = {
					allowed: newPerm?.allow ? newPerm.allow.bitfield : 0,
					denied: newPerm?.deny ? newPerm.deny.bitfield : 0,
				};
					// load roles / guildmember for that overwrite
				let role;
				let member;
				if (oldPerm?.type == OverwriteType.Role || newPerm?.type == OverwriteType.Role) {
					role = newChannel.guild.roles.cache.get((newPerm?.id || oldPerm?.id) as string);
				}
				if (oldPerm?.type == OverwriteType.Member || newPerm?.type == OverwriteType.Member) {
					member = await newChannel.guild.members.fetch((newPerm?.id || oldPerm?.id) as string);
				}
				// make text about what changed
				let value = '';
				if (oldBitfields.allowed !== newBitfields.allowed) {
					value += `Allowed Perms: \`${oldBitfields.allowed}\` to \`${newBitfields.allowed}\`\n`;
				}
				if (oldBitfields.denied !== newBitfields.denied) {
					value += `Denied Perms: \`${oldBitfields.denied}\` to \`${newBitfields.denied}\``;
				}
				if (!value.length) value = 'Overwrite got deleted';
				// add field to embed
				embed.addFields({
					'name': role ? role.name + ` (ID: ${role.id}):` : member?.user.displayName + ` (ID: ${member?.id}):`,
					'value': value,
				});
			}

			this.sendEmbed(client, newChannel.guild, embed, moderationSettings.loggingChannelId);
		}
	}

	async sendEmbed(client: EgglordClient, guild: Guild, embed: JSONEncodable<APIEmbed>, loggingChannelId: string | null) {
		// Find channel and send message
		try {
			if (loggingChannelId == null || embed == undefined) return;
			const modChannel = await guild.channels.fetch(loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}
