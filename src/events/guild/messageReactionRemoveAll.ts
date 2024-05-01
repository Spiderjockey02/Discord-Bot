import Event from 'src/structures/Event';
import { Collection, Events, Message, MessageReaction, Snowflake } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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
	async run(client: EgglordClient, message: Message, reactions: Collection<(string|Snowflake), MessageReaction>) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Message all reactions removed ${!message.guild ? '' : ` in guild: ${message.guild.id}`}`);

		// If message needs to be fetched
		try {
			if (message.partial) await message.fetch();
		} catch (err: any) {
			return client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Get server settings / if no settings then return
		const settings = message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event messageReactionRemove is for logging
		if (settings.ModLogEvents?.includes('MESSAGEREACTIONREMOVEALL') && settings.ModLog) {
			const embed = new Embed(client, message.guild)
				.setDescription(`**All reactions removed from [this message](${message.url})** `)
				.setColor(15158332)
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${message.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == message.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}