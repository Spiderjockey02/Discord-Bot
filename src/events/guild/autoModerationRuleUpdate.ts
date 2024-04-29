// Dependencies
const	{ Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Channel create event
 * @event Egglord#AutoModerationRuleUpdate
 * @extends {Event}
*/
class AutoModerationRuleUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
   * Function for receiving event.
   * @param {bot} bot The instantiating client
   * @param {?AutoModerationRule} oldAutoModerationRule The auto moderation rule before the update
   * @param {AutoModerationRule} newAutoModerationRule The auto moderation rule after the update
   * @readonly
  */
	async run(bot, oldAutoModerationRule, newAutoModerationRule) {
		const { guild } = newAutoModerationRule;

		// Check if event AutoModerationRuleUpdate is for logging
		if (guild.settings.ModLogEvents?.includes('AUTOMODERATIONRULEUPDATE') && guild.settings.ModLog) {

			// Check if exempt channels has changed

			// Check if exempt roles has changed

			// Check if punishment has changed

			// Check if actions has changed

			try {
				const modChannel = await bot.channels.fetch(guild.settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = AutoModerationRuleUpdate;
