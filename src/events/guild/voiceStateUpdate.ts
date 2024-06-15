import { Event } from '../../structures';
import { APIEmbed, ChannelType, Colors, Events, Guild, GuildChannel, GuildMember, GuildTextBasedChannel, JSONEncodable, VoiceState } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';
import { setTimeout } from 'timers/promises';

/**
 * Voice state update event
 * @event Egglord#VoiceStateUpdate
 * @extends {Event}
*/
export default class VoiceStateUpdate extends Event {
	constructor() {
		super({
			name: Events.VoiceStateUpdate,
			dirname: __dirname,
		});
	}

	/**
 * Function for receiving event.
 * @param {client} client The instantiating client
 * @param {VoiceState} oldState The voice state before the update
 * @param {VoiceState} newState The voice state after the update
 * @readonly
*/
	async run(client: EgglordClient, oldState: VoiceState, newState: VoiceState) {
		// variables for easier coding
		const newMember = newState.guild?.members.cache.get(newState.id ?? oldState.id) as GuildMember;
		const channel = newState.guild?.channels.cache.get(newState.channelId as string) as GuildChannel;

		// Check if event voiceStateUpdate is for logging
		const moderationSettings = newState.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		// member has been server (un)deafened
		if (oldState.serverDeaf != newState.serverDeaf) {
			const embed = new EgglordEmbed(client, newState.guild)
				.setDescription(`**${newMember} was server ${newState.serverDeaf ? '' : 'un'}deafened in ${channel.toString()}**`)
				.setColor(newState.serverDeaf ? Colors.Red : Colors.Green)
				.setTimestamp()
				.setFooter({ text: `User: ${newMember.id}` })
				.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() });
			this.sendEmbed(client, newState.guild, embed, moderationSettings.loggingChannelId);
		}

		// member has been server (un)muted
		if (oldState.serverMute != newState.serverMute) {
			const embed = new EgglordEmbed(client, newState.guild)
				.setDescription(`**${newMember} was server ${newState.serverMute ? '' : 'un'}muted in ${channel.toString()}**`)
				.setColor(newState.serverMute ? Colors.Red : Colors.Green)
				.setTimestamp()
				.setFooter({ text: `User: ${newMember.id}` })
				.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() });
			this.sendEmbed(client, newState.guild, embed, moderationSettings.loggingChannelId);
		}

		// member has (stopped/started) streaming
		if (oldState.streaming != newState.streaming) {
			const embed = new EgglordEmbed(client, newState.guild)
				.setDescription(`**${newMember} has ${newState.streaming ? 'started' : 'stopped'} streaming in ${channel.toString()}**`)
				.setColor(newState.streaming ? Colors.Red : Colors.Green)
				.setTimestamp()
				.setFooter({ text: `User: ${newMember.id}` })
				.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() });
			this.sendEmbed(client, newState.guild, embed, moderationSettings.loggingChannelId);
		}

		// Only keep the client in the voice channel by its self for 3 minutes
		const player = client.audioManager?.players.get(newState.guild.id);
		if (!player) return;

		if (!newState.guild.members.cache.get(client.user.id)?.voice.channelId) player.destroy();

		// Check for stage channel audience change
		if (newState.id == client.user.id && channel?.type == ChannelType.GuildStageVoice) {
			if (!oldState.channelId) {
				try {
					await newState.guild.members.me?.voice.setSuppressed(false).then(() => console.log(null));
				} catch (err) {
					player.pause(true);
				}
			} else if (oldState.suppress !== newState.suppress) {
				player.pause(newState.suppress ?? true);
			}
		}


		if (oldState.id === client.user.id) return;
		if (!oldState.guild.members.cache.get(client.user.id)?.voice.channelId) return;


		// Make sure the client is in the voice channel that 'activated' the event
		if (oldState.guild.members.cache.get(client.user.id)?.voice.channelId === oldState.channelId) {
			if (oldState.guild.members.me?.voice?.channel && oldState.guild.members.me.voice.channel.members.filter(m => !m.user.client).size === 0) {
				const vcName = oldState.guild.members.me.voice.channel.name;
				await setTimeout(180000);

				// times up check if client is still by themselves in VC (exluding clients)
				const vcMembers = oldState.guild.members.me.voice.channel?.members.size;
				if (!vcMembers || vcMembers === 1) {
					const newPlayer = client.audioManager?.players.get(newState.guild.id);
					(newPlayer) ? player.destroy() : newState.guild.members.me?.voice.disconnect();
					const embed = new EgglordEmbed(client, newState.guild)
					// eslint-disable-next-line no-inline-comments
						.setDescription(`I left 🔉 **${vcName}** because I was inactive for too long.`); // If you are a [Premium](${client.config.websiteURL}/premium) member, you can disable this by typing ${settings.prefix}24/7.`);
					try {
						if (player.textChannel == null) return;
						const c = client.channels.cache.get(player.textChannel) as GuildTextBasedChannel;
						if (c) c.send({ embeds: [embed] });
					} catch (err) {
						client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
					}
				}
			}
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