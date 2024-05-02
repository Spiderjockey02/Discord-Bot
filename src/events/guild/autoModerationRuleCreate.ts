import { AutoModerationAction, AutoModerationActionType, AutoModerationRule, AutoModerationRuleKeywordPresetType, AutoModerationTriggerMetadata, Events } from 'discord.js';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

/**
 * Channel create event
 * @event Egglord#AutoModerationRuleCreate
 * @extends {Event}
*/
export default class AutoModerationRuleCreate extends Event {
	constructor() {
		super({
			name: Events.AutoModerationRuleCreate,
			dirname: __dirname,
		});
	}

	/**
   * Function for receiving event.
   * @param {client} client The instantiating client
   * @param {AutoModerationRule} autoModerationRule The created auto moderation rule
   * @readonly
  */
	async run(client: EgglordClient, { actions, name, guild, creatorId, exemptChannels, exemptRoles, triggerMetadata }: AutoModerationRule) {
		client.logger.debug(`Guild: ${guild.id} has added a new auto moderation rule: ${name}.`);

		// Check if event AutoModerationRuleCreate is for logging
		const moderationSettings = guild.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, guild)
				.setTitle(`Auto-mod rule created: ${name}.`)
				.setColor(3066993)
				.addFields(
					{ name: 'Exempt channels:', value: `${exemptChannels.size > 0 ? exemptChannels.map(c => `${c}`).join(',') : 'No exempt channels.'}`, inline: true },
					{ name: 'Exempt roles:', value: `${exemptRoles.size > 0 ? exemptRoles.map(r => `${r}`).join(',') : 'No exempt roles.'}`, inline: true },
					{ name: 'Punishment:', value: `${actions.length > 0 ? actions.map(a => this.punishmentParser(client, a)).join(',\n') : 'No action required.'}` },
					{ name: 'Trigger:', value: this.triggerParser(triggerMetadata).join(',\n') },
				)
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

	/**
	 * Function for parsing action of an auto moderation rule
	 * @param {client} client The instantiating client
	 * @param {AutoModerationAction} action The action of this auto moderation rule.
	 * @return {string}
	*/
	punishmentParser(client: EgglordClient, action: AutoModerationAction) {
		switch (action.type) {
			case AutoModerationActionType.BlockMessage:
				return 'Type: `Block message`';
			case AutoModerationActionType.SendAlertMessage:
				if (action.metadata.channelId == null) return '';
				return `Type: \`Send Alert Message\` to ${client.channels.cache.get(action.metadata.channelId)}`;
			case AutoModerationActionType.Timeout:
				return `Type: \`Member Timeout\` for ${action.metadata.durationSeconds}s`;
		}
	}

	/**
	 * Function for parsing triggers of an auto moderation rule
	 * @param {client} client The instantiating client
	 * @param {AutoModerationTriggerMetadata} triggerMetadata The trigger metadata of the rule.
	 * @return {string}
	*/
	triggerParser(triggerMetadata: AutoModerationTriggerMetadata) {
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
