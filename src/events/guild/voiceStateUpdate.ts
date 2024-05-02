import { Event } from '../../structures';
import { ChannelType, Events, GuildChannel, GuildMember, GuildTextBasedChannel, VoiceState } from 'discord.js';
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
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			let embed, updated = false;

			// member has been server (un)deafened
			if (oldState.serverDeaf != newState.serverDeaf) {
				embed = new EgglordEmbed(client, newState.guild)
					.setDescription(`**${newMember} was server ${newState.serverDeaf ? '' : 'un'}deafened in ${channel.toString()}**`)
					.setColor(newState.serverDeaf ? 15158332 : 3066993)
					.setTimestamp()
					.setFooter({ text: `User: ${newMember.id}` })
					.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() });
				updated = true;
			}

			// member has been server (un)muted
			if (oldState.serverMute != newState.serverMute) {
				embed = new EgglordEmbed(client, newState.guild)
					.setDescription(`**${newMember} was server ${newState.serverMute ? '' : 'un'}muted in ${channel.toString()}**`)
					.setColor(newState.serverMute ? 15158332 : 3066993)
					.setTimestamp()
					.setFooter({ text: `User: ${newMember.id}` })
					.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() });
				updated = true;
			}

			// member has (stopped/started) streaming
			if (oldState.streaming != newState.streaming) {
				embed = new EgglordEmbed(client, newState.guild)
					.setDescription(`**${newMember} has ${newState.streaming ? 'started' : 'stopped'} streaming in ${channel.toString()}**`)
					.setColor(newState.streaming ? 15158332 : 3066993)
					.setTimestamp()
					.setFooter({ text: `User: ${newMember.id}` })
					.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() });
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					if (moderationSettings.loggingChannelId == null || embed == undefined) return;
					const modChannel = await newState.guild.channels.fetch(moderationSettings.loggingChannelId);
					if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
				} catch (err: any) {
					client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
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
				} catch (err: any) {
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
					} catch (err: any) {
						client.logger.error(err.message);
					}
				}
			}
		}
	}
}