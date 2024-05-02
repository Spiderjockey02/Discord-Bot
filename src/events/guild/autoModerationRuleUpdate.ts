import { AutoModerationRule, Events } from 'discord.js';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

/**
 * Channel create event
 * @event Egglord#AutoModerationRuleUpdate
 * @extends {Event}
*/
export default class AutoModerationRuleUpdate extends Event {
	constructor() {
		super({
			name: Events.AutoModerationRuleUpdate,
			dirname: __dirname,
		});
	}

	/**
   * Function for receiving event.
   * @param {client} client The instantiating client
   * @param {?AutoModerationRule} oldAutoModerationRule The auto moderation rule before the update
   * @param {AutoModerationRule} newAutoModerationRule The auto moderation rule after the update
   * @readonly
  */
	async run(client: EgglordClient, _oldAutoModerationRule: AutoModerationRule, newAutoModerationRule: AutoModerationRule) {
		const { guild } = newAutoModerationRule;

		// Check if event AutoModerationRuleUpdate is for logging
		const moderationSettings = guild.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, guild);
			// Check if exempt channels has changed

			// Check if exempt roles has changed

			// Check if punishment has changed

			// Check if actions has changed

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