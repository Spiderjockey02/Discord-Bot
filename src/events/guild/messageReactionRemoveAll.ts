import { Event } from '../../structures';
import { Collection, Events, Message, MessageReaction, Snowflake } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

/**
 * Message reaction remove all event
 * @event Egglord#MessageReactionRemoveAll
 * @extends {Event}
*/
export default class MessageReactionRemoveAll extends Event {
	constructor() {
		super({
			name: Events.MessageReactionRemoveAll,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Message} message The message the reactions were removed from
	 * @readonly
	*/
	async run(client: EgglordClient, message: Message, _reactions: Collection<(string|Snowflake), MessageReaction>) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Message all reactions removed ${!message.guild ? '' : ` in guild: ${message.guild.id}`}`);

		// If message needs to be fetched
		try {
			if (message.partial) await message.fetch();
		} catch (err: any) {
			return client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Check if event messageReactionRemove is for logging
		const moderationSettings = message.guild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, message.guild)
				.setDescription(`**All reactions removed from [this message](${message.url})** `)
				.setColor(15158332)
				.setTimestamp();

			// Find channel and send message
			try {
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await message.guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}