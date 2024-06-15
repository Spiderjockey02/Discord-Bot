import { AutoModerationRule, Colors, Events } from 'discord.js';
import { Event, EgglordEmbed } from '../../structures';
import EgglordClient from '../../base/Egglord';

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
		client.logger.debug(`Guild: ${guild.id} has removed an auto moderation rule: ${name}.`);

		// Check if event AutoModerationRuleCreate is for logging
		const moderationSettings = guild.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, guild)
			.setTitle('events/automoderation:CREATE_TITLE', { name })
			.setColor(Colors.Red)
			.setFooter({ text: client.users.cache.get(creatorId)?.displayName ?? '', iconURL: client.users.cache.get(creatorId)?.displayAvatarURL() });

		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}
