import { Events, MessageReaction, User } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

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

		// Get server settings / if no settings then return
		const settings = reaction.message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event messageReactionRemove is for logging
		if (settings.ModLogEvents?.includes('MESSAGEREACTIONREMOVE') && settings.ModLog) {
			const embed = new Embed(client, reaction.message.guild)
				.setDescription(`**${user.toString()} unreacted with ${reaction.emoji.toString()} to [this message](${reaction.message.url})** `)
				.setColor(15158332)
				.setFooter({ text: `User: ${user.id} | Message: ${reaction.message.id} ` })
				.setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${reaction.message.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == reaction.message.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
