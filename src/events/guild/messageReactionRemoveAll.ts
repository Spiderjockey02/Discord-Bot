import { Event, EgglordEmbed } from '../../structures';
import { Collection, Colors, Events, Message, MessageReaction, Snowflake } from 'discord.js';
import EgglordClient from '../../base/Egglord';


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
		client.logger.debug(`Message all reactions removed ${!message.guild ? '' : ` in guild: ${message.guild.id}`}`);

		// If message needs to be fetched
		try {
			if (message.partial) await message.fetch();
		} catch (err) {
			return client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}

		// Check if event messageReactionRemove is for logging
		const moderationSettings = message.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;
		const embed = new EgglordEmbed(client, message.guild)
			.setDescription(`**All reactions removed from [this message](${message.url})** `)
			.setColor(Colors.Red)
			.setTimestamp();

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await message.guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}