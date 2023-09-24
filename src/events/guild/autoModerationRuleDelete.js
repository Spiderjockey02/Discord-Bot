// Dependencies
const	{ Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Channel create event
 * @event Egglord#AutoModerationRuleDelete
 * @extends {Event}
*/
class AutoModerationRuleDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
   * Function for receiving event.
   * @param {bot} bot The instantiating client
   * @param {AutoModerationRule} autoModerationRule The deleted auto moderation rule
   * @readonly
  */
	async run(bot, { creatorId, name, guild }) {
		bot.logger.debug(`Guild: ${guild.id} has removed a new auto moderation rule: ${name}.`);

		// Check if event AutoModerationRuleCreate is for logging
		if (guild.settings.ModLogEvents?.includes('AUTOMODERATIONRULEDELETE') && guild.settings.ModLog) {
			const embed = new Embed(bot, guild)
				.setTitle(`Auto-mod rule deleted: ${name}.`)
				.setColor(15158332)
				.setFooter({ text: bot.users.cache.get(creatorId).displayName, iconURL: bot.users.cache.get(creatorId).displayAvatarURL() });


			try {
				const modChannel = await bot.channels.fetch(guild.settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}

	}
}

module.exports = AutoModerationRuleDelete;
