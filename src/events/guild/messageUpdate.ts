import Event from 'src/structures/Event';
import { Events, Message } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

/**
 * Message update event
 * @event Egglord#MessageUpdate
 * @extends {Event}
*/
export default class MessageUpdate extends Event {
	constructor() {
		super({
			name: Events.MessageUpdate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Message} oldMessage The message before the update
	 * @param {Message} newMessage The message after the update
	 * @readonly
	*/
	async run(client: EgglordClient, oldMessage: Message, newMessage: Message) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Message updated${!newMessage.guild ? '' : ` in guild: ${newMessage.guild.id}`}`);

		// make sure its not a DM
		if (!newMessage.guild) return;

		// Check if message is a partial
		try {
			if (oldMessage.partial) await oldMessage.fetch();
			if (newMessage.partial) await newMessage.fetch();
		} catch (err: any) {
			if (err.message == 'Missing Access') return;
			return client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// only check for message content is different
		if (oldMessage.content == newMessage.content || !newMessage.content || !oldMessage.content) return;

		// Get server settings / if no settings then return
		const settings = newMessage.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelDelete is for logging
		if (settings.ModLogEvents?.includes('MESSAGEUPDATE') && settings.ModLog) {
			// shorten clienth messages when the content is larger then 1024 chars
			let oldShortened = false;
			let oldContent = oldMessage.content;
			if (oldContent.length > 1024) {
				oldContent = oldContent.slice(0, 1020) + '...';
				oldShortened = true;
			}
			let newShortened = false;
			let newContent = newMessage.content;
			if (newContent.length > 1024) {
				newContent = newContent.slice(0, 1020) + '...';
				newShortened = true;
			}
			const embed = new Embed(client, newMessage.guild)
				.setDescription(`**Message of ${newMessage.author.toString()} edited in ${newMessage.channel.toString()}** [Jump to Message](${newMessage.url})`)
				.setFooter({ text: `Author: ${newMessage.author.id} | Message: ${newMessage.id}` })
				.setAuthor({ name: newMessage.author.displayName, iconURL: newMessage.author.displayAvatarURL() })
				.addFields(
					{ name: `Before ${(oldShortened ? ' (shortened)' : '')}:`, value: `${oldMessage.content.length > 0 ? oldContent : '*empty message*'}`, inline: true },
					{ name: `After ${(newShortened ? ' (shortened)' : '')}:`, value: `${newMessage.content.length > 0 ? newContent : '*empty message*'}`, inline: true })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${newMessage.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == newMessage.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}