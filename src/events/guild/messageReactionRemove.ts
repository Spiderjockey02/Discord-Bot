import { Events, MessageReaction, User } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event } from '../../structures';
import { EgglordEmbed } from '../../utils';

/**
 * Message reaction remove event
 * @event Egglord#MessageReactionRemove
 * @extends {Event}
*/
export default class MessageReactionRemove extends Event {
	constructor() {
		super({
			name: Events.MessageReactionRemove,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {MessageReaction} reaction The reaction object
	 * @param {User} user The user that removed the reaction
	 * @readonly
	*/
	async run(client: EgglordClient, reaction: MessageReaction, user: User) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Message reaction removed${!reaction.message.guild ? '' : ` in guild: ${reaction.message.guild.id}`}`);

		// Make sure it's not a client and in a guild
		if (user.client || !reaction.message.guild) return;

		// If reaction needs to be fetched
		try {
			if (reaction.partial) await reaction.fetch();
			if (reaction.message.partial) await reaction.message.fetch();
		} catch (err: any) {
			return client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// make sure the message author isn't the client
		if (reaction.message.author?.id == client.user.id) return;

		// Check if event messageReactionRemove is for logging
		const moderationSettings = reaction.message.guild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, reaction.message.guild)
				.setDescription(`**${user.toString()} unreacted with ${reaction.emoji.toString()} to [this message](${reaction.message.url})** `)
				.setColor(15158332)
				.setFooter({ text: `User: ${user.id} | Message: ${reaction.message.id} ` })
				.setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await reaction.message.guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
