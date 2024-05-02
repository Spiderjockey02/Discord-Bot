import { Event } from '../../structures';
import { AnyThreadChannel, Collection, Events, Snowflake, ThreadMember } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';
/**
 * Thread members update event
 * @event Egglord#ThreadMembersUpdate
 * @extends {Event}
*/
export default class ThreadMembersUpdate extends Event {
	constructor() {
		super({
			name: Events.ThreadMemberUpdate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Collection<Snowflake, ThreadMember>} oldMembers The members before the update
	 * @param {Collection<Snowflake, ThreadMember>} newMembers The members after the update
	 * @readonly
	*/
	async run(client: EgglordClient, oldMembers: Collection<Snowflake, ThreadMember>, newMembers: Collection<Snowflake, ThreadMember>) {
		// Get thread
		const thread = oldMembers.first()?.thread ?? newMembers.first()?.thread as AnyThreadChannel;

		// For debugging
		if (client.config.debug) client.logger.debug(`Thread: ${thread.name} member count has been updated in guild: ${thread.guildId}. (${thread.type})`);

		// Check if event channelDelete is for logging
		const moderationSettings = thread.guild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			// emoji role update
			if (oldMembers.size != newMembers.size) {
				const memberAdded = newMembers.filter(x => !oldMembers.get(x.id));
				const memberRemoved = oldMembers.filter(x => !newMembers.get(x.id));
				if (memberAdded.size != 0 || memberRemoved.size != 0) {
					const memberAddedString = [];
					for (const role of [...memberAdded.values()]) {
						memberAddedString.push(thread.guild.members.cache.get(role.id));
					}
					const memberRemovedString = [];
					for (const role of [...memberRemoved.values()]) {
						memberRemovedString.push(thread.guild.members.cache.get(role.id));
					}

					// create embed
					const embed = new EgglordEmbed(client, thread.guild)
						.setDescription(`**Thread members updated in ${thread.toString()}**`)
						.setColor(15105570)
						.setFooter({ text: `ID: ${thread.id}` })
						.setAuthor({ name: thread.guild.name, iconURL: thread.guild.iconURL() ?? undefined })
						.addFields(
							{ name: `Added members [${memberAdded.size}]:`, value: `${memberAddedString.length == 0 ? '*None*' : memberAddedString.join('\n ')}`, inline: true },
							{ name: `Removed member [${memberRemoved.size}]:`, value: `${memberRemovedString.length == 0 ? '*None*' : memberRemovedString.join('\n ')}`, inline: true })
						.setTimestamp();

					// Find channel and send message
					try {
						if (moderationSettings.loggingChannelId == null) return;
						const modChannel = await thread.guild.channels.fetch(moderationSettings.loggingChannelId);
						if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
					} catch (err: any) {
						client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
					}
				}
			}
		}
	}
}
