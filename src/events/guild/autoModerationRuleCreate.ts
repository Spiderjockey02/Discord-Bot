// Dependencies
const	{ Embed } = require('../../utils'),
	{ AutoModerationActionType, AutoModerationRuleKeywordPresetType } = require('discord-api-types/v10'),
	Event = require('../../structures/Event');

/**
 * Channel create event
 * @event Egglord#AutoModerationRuleCreate
 * @extends {Event}
*/
class AutoModerationRuleCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
   * Function for receiving event.
   * @param {bot} bot The instantiating client
   * @param {AutoModerationRule} autoModerationRule The created auto moderation rule
   * @readonly
  */
	async run(bot, { actions, name, guild, creatorId, exemptChannels, exemptRoles, triggerMetadata }) {
		bot.logger.debug(`Guild: ${guild.id} has added a new auto moderation rule: ${name}.`);

		// Check if event AutoModerationRuleCreate is for logging
		if (guild.settings.ModLogEvents?.includes('AUTOMODERATIONRULECREATE') && guild.settings.ModLog) {
			const embed = new Embed(bot, guild)
				.setTitle(`Auto-mod rule created: ${name}.`)
				.setColor(3066993)
				.addFields(
					{ name: 'Exempt channels:', value: `${exemptChannels.length > 0 ? exemptChannels.map(c => `${c}`).join(',') : 'No exempt channels.'}`, inline: true },
					{ name: 'Exempt roles:', value: `${exemptRoles.length > 0 ? exemptRoles.map(r => `${r}`).join(',') : 'No exempt roles.'}`, inline: true },
					{ name: 'Punishment:', value: `${actions.length > 0 ? actions.map(a => this.punishmentParser(bot, a)).join(',\n') : 'No action required.'}` },
					{ name: 'Trigger:', value: this.triggerParser(triggerMetadata).join(',\n') },
				)
				.setFooter({ text: bot.users.cache.get(creatorId).displayName, iconURL: bot.users.cache.get(creatorId).displayAvatarURL() });

			try {
				const modChannel = await bot.channels.fetch(guild.settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}

	/**
	 * Function for parsing action of an auto moderation rule
	 * @param {bot} bot The instantiating client
	 * @param {AutoModerationAction} action The action of this auto moderation rule.
	 * @return {string}
	*/
	punishmentParser(bot, action) {
		switch (action.type) {
			case AutoModerationActionType.BlockMessage:
				return 'Type: `Block message`';
			case AutoModerationActionType.SendAlertMessage:
				return `Type: \`Send Alert Message\` to ${bot.channels.cache.get(action.metadata.channelId)}`;
			case AutoModerationActionType.Timeout:
				return `Type: \`Member Timeout\` for ${action.metadata.durationSeconds}s`;
		}
	}

	/**
	 * Function for parsing triggers of an auto moderation rule
	 * @param {bot} bot The instantiating client
	 * @param {AutoModerationTriggerMetadata} triggerMetadata The trigger metadata of the rule.
	 * @return {string}
	*/
	triggerParser(triggerMetadata) {
		const triggers = [];

		// Check for keyword filtering
		if (triggerMetadata.keywordFilter.length > 0) {
			triggers.push(`Keywords: ${triggerMetadata.keywordFilter.join(', ')}`);
		}

		// Check for regex pattern filtering
		if (triggerMetadata.regexPatterns.length > 0) {
			triggers.push(`Regex: ${triggerMetadata.regexPatterns.join(', ')}`);
		}

		// Check if any presets have been given (Profanity, SexualContent, Slurs)
		if (triggerMetadata.presets.length > 0) {
			const temp = [];
			for (const presets of triggerMetadata.presets) {
				switch (presets) {
					case AutoModerationRuleKeywordPresetType.Profanity:
						temp.push('Profanity');
						break;
					case AutoModerationRuleKeywordPresetType.SexualContent:
						temp.push('Sexual Content');
						break;
					case AutoModerationRuleKeywordPresetType.Slurs:
						temp.push('Slurs');
						break;
				}
			}
			triggers.push(`Presets: ${temp.join(', ')}`);
		}

		// Check for words that should be ignored from they keyword filtering
		if (triggerMetadata.allowList.length > 0) {
			triggers.push(`Whitelisted words: ${triggerMetadata.allowList.join(', ')}`);
		}

		// The maximum number of mentions per a message
		if (triggerMetadata.mentionTotalLimit) {
			triggers.push(`Maximum mentions: ${triggerMetadata.mentionTotalLimit}`);
		}

		return triggers;
	}
}

module.exports = AutoModerationRuleCreate;
