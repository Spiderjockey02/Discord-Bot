import { AutoModerationRule, Events } from 'discord.js';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

/**
 * Channel create event
 * @event Egglord#AutoModerationRuleDelete
 * @extends {Event}
*/
export default class AutoModerationRuleDelete extends Event {
	constructor() {
		super({
			name: Events.AutoModerationRuleDelete,
			dirname: __dirname,
		});
	}

	/**
   * Function for receiving event.
   * @param {client} client The instantiating client
   * @param {AutoModerationRule} autoModerationRule The deleted auto moderation rule
   * @readonly
  */
	async run(client: EgglordClient, { creatorId, name, guild }: AutoModerationRule) {
		client.logger.debug(`Guild: ${guild.id} has removed a new auto moderation rule: ${name}.`);

		// Check if event AutoModerationRuleCreate is for logging
		const moderationSettings = guild.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, guild)
				.setTitle(`Auto-mod rule deleted: ${name}.`)
				.setColor(15158332)
				.setFooter({ text: client.users.cache.get(creatorId)?.displayName ?? '', iconURL: client.users.cache.get(creatorId)?.displayAvatarURL() });

			try {
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}

	}
}
