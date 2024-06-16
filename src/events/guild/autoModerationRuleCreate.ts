import { AutoModerationAction, AutoModerationActionType, AutoModerationRule, AutoModerationRuleKeywordPresetType, AutoModerationTriggerMetadata, Colors, Events, Guild } from 'discord.js';
import { Event, EgglordEmbed } from '../../structures';
import EgglordClient from '../../base/Egglord';

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
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		// Parse lists
		const exemptChannelsParsed = exemptChannels.size > 0 ? exemptChannels.map(c => `${c}`).join(',') : client.languageManager.translate(guild, 'events/automoderation:NO_EXEMPT_CHANNELS');
		const exemptRolesParsed = exemptRoles.size > 0 ? exemptRoles.map(r => `${r}`).join(',') : client.languageManager.translate(guild, 'events/automoderation:NO_EXEMPT_ROLES');
		const punishments = actions.length > 0 ? actions.map(action => this.punishmentParser(client, guild, action)).join(',\n') : client.languageManager.translate(guild, 'events/automoderation:NO_PUNISHMENT');

		const embed = new EgglordEmbed(client, guild)
			.setTitle('guild/automoderation:CREATE_TITLE', { name })
			.setColor(Colors.Green)
			.addFields(
				{ name: client.languageManager.translate(guild, 'events/automoderation:EXEMPT_CHANNEL'), value: exemptChannelsParsed, inline: true },
				{ name: client.languageManager.translate(guild, 'events/automoderation:EXEMPT_ROLES'), value: exemptRolesParsed, inline: true },
				{ name: client.languageManager.translate(guild, 'events/automoderation:PUNISHMENT'), value: punishments },
				{ name: client.languageManager.translate(guild, 'events/automoderation:TRIGGER'), value: this.triggerParser(client, guild, triggerMetadata).join(',\n') },
			)
			.setFooter({ text: client.users.cache.get(creatorId)?.displayName ?? '', iconURL: client.users.cache.get(creatorId)?.displayAvatarURL() });

		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}

	}

	/**
	 * Function for parsing action of an auto moderation rule
	 * @param {client} client The instantiating client
	 * @param {Guild} guild The guild
	 * @param {AutoModerationAction} action The action of this auto moderation rule.
	 * @return {string}
	*/
	punishmentParser(client: EgglordClient, guild: Guild, action: AutoModerationAction) {
		switch (action.type) {
			case AutoModerationActionType.BlockMessage:
				return client.languageManager.translate(guild, 'events/automoderation:BLOCK_MESSAGE');
			case AutoModerationActionType.SendAlertMessage:
				if (action.metadata.channelId == null) return '';
				return client.languageManager.translate(guild, 'events/automoderation:SEND_ALERT', { CHANNEL: `${client.channels.cache.get(action.metadata.channelId)}` });
			case AutoModerationActionType.Timeout:
				return client.languageManager.translate(guild, 'events/automoderation:TIMEOUT', { DURATION: `${action.metadata.durationSeconds}` });
		}
	}

	/**
	 * Function for parsing triggers of an auto moderation rule
	 * @param {client} client The instantiating client
	 * @param {Guild} guild The guild
	 * @param {AutoModerationTriggerMetadata} triggerMetadata The trigger metadata of the rule.
	 * @return {string}
	*/
	triggerParser(client: EgglordClient, guild: Guild, triggerMetadata: AutoModerationTriggerMetadata) {
		const triggers = [];

		// Check for keyword filtering
		if (triggerMetadata.keywordFilter.length > 0) {
			triggers.push(client.languageManager.translate(guild, 'events/automoderation:KEYWORDS', { WORDS: triggerMetadata.keywordFilter.join(', ') }));
		}

		// Check for regex pattern filtering
		if (triggerMetadata.regexPatterns.length > 0) {
			triggers.push(client.languageManager.translate(guild, 'events/automoderation:REGEX', { REGEX: triggerMetadata.regexPatterns.join(', ') }));
		}

		// Check if any presets have been given (Profanity, SexualContent, Slurs)
		if (triggerMetadata.presets.length > 0) {
			const temp = [];
			for (const presets of triggerMetadata.presets) {
				switch (presets) {
					case AutoModerationRuleKeywordPresetType.Profanity:
						temp.push(client.languageManager.translate(guild, 'events/automoderation:PROFANITY'));
						break;
					case AutoModerationRuleKeywordPresetType.SexualContent:
						temp.push(client.languageManager.translate(guild, 'events/automoderation:SEXUAL_CONTENT'));
						break;
					case AutoModerationRuleKeywordPresetType.Slurs:
						temp.push(client.languageManager.translate(guild, 'events/automoderation:SLURS'));
						break;
				}
			}
			triggers.push(client.languageManager.translate(guild, 'events/automoderation:PRESETS', { VALUES: temp.join(', ') }));
		}

		// Check for words that should be ignored from they keyword filtering
		if (triggerMetadata.allowList.length > 0) {
			triggers.push(client.languageManager.translate(guild, 'events/automoderation:WHITELIST_WORDS', { WORDS: triggerMetadata.allowList.join(', ') }));
		}

		// The maximum number of mentions per a message
		if (triggerMetadata.mentionTotalLimit) {
			triggers.push(client.languageManager.translate(guild, 'events/automoderation:MAX_MENTIONS', { NUMBER: triggerMetadata.mentionTotalLimit }));
		}

		return triggers;
	}
}
