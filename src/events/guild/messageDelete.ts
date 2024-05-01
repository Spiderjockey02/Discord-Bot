import Event from 'src/structures/Event';
import { ChannelType, Events, Message } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

/**
 * Message delete event
 * @event Egglord#MessageDelete
 * @extends {Event}
*/
export default class MessageDelete extends Event {
	constructor() {
		super({
			name: Events.MessageDelete,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Message} message The deleted message
	 * @readonly
	*/
	async run(client: EgglordClient, message: Message) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Message has been deleted${!message.guild ? '' : ` in guild: ${message.guild.id}`}.`);

		// Make sure the message wasn't deleted in a Dm channel
		if (message.channel.type == ChannelType.DM) return;

		// If someone leaves the server and the server has default discord messages, it gets removed but says message content is null (Don't know why)
		if (!message.content && message.attachments.size == 0 && message.embeds[0]) return;

		// if the message is a partial or a webhook return
		if (message.partial || message.webhookId) return;

		// Check if the message was a giveaway/reaction role embed
		try {
			// check reaction roles
			const rr = await ReactionRoleSchema.findOneAndRemove({ messageID: message.id,	channelID: message.channel.id });
			if (rr) client.logger.log('A reaction role embed was deleted.');

			// check giveaways
			const g = await GiveawaySchema.findOneAndRemove({ messageID: message.id,	channelID: message.channel.id });
			if (g) {
				await client.giveawaysManager.delete(message.id);
				client.logger.log('A giveaway embed was deleted.');
			}
		} catch (err: any) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Make sure its not the client
		if (message.author.id == client.user.id) return;

		// Get server settings / if no settings then return
		const settings = message.guild?.settings ?? [];
		if (Object.keys(settings).length == 0) return;

		// Check if ModLog plugin is active
		if (message.content.startsWith(settings.prefix)) return;

		// Check if event messageDelete is for logging
		if (settings.ModLogEvents?.includes('MESSAGEDELETE') && settings.ModLog) {
			// shorten message if it's longer then 1024
			let shortened = false;
			let content = message.content;
			if (content.length > 1024) {
				content = content.slice(0, 1020) + '...';
				shortened = true;
			}

			// Basic message construct
			const embed = new Embed(client, message.guild)
				.setDescription(`**Message from ${message.author.toString()} deleted in ${message.channel.toString()}**`)
				.setColor(15158332)
				.setFooter({ text: `Author: ${message.author.id} | Message: ${message.id}` })
				.setAuthor({ name: message.author.displayName, iconURL: message.author.displayAvatarURL() });
			if (message.content.length > 0) embed.addFields({ name: `Content ${shortened ? ' (shortened)' : ''}:`, value: `${content}` });
			embed.setTimestamp();
			// check for attachment deletion
			if (message.attachments.size > 0) {
				embed.addFields({
					'name': 'Attachments:',
					'value': message.attachments.map(file => file.url).join('\n'),
				});
			}

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
