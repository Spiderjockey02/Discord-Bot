import { AutoModerationRule, Events } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

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
		if (guild.settings.ModLogEvents?.includes('AUTOMODERATIONRULEUPDATE') && guild.settings.ModLog) {

			// Check if exempt channels has changed

			// Check if exempt roles has changed

			// Check if punishment has changed

			// Check if actions has changed

			try {
				const modChannel = await client.channels.fetch(guild.settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guild.id) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}