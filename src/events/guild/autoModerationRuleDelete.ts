import { AutoModerationRule, Events } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';
import { EgglordEmbed } from 'src/utils';

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
		if (guild.settings.ModLogEvents?.includes('AUTOMODERATIONRULEDELETE') && guild.settings.ModLog) {
			const embed = new EgglordEmbed(client, guild)
				.setTitle(`Auto-mod rule deleted: ${name}.`)
				.setColor(15158332)
				.setFooter({ text: client.users.cache.get(creatorId)?.displayName, iconURL: client.users.cache.get(creatorId)?.displayAvatarURL() });


			try {
				const modChannel = await client.channels.fetch(guild.settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guild.id) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}

	}
}
