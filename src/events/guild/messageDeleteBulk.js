// Dependencies
const dateFormat = require('dateformat'),
	{ MessageAttachment } = require('discord.js'),
	{ Embed } = require('../../utils'),
	Event = require('../../structures/Event');

module.exports = class messageDeleteBulk extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, messages) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`${messages.size} messages have been deleted in guild: ${messages.first().guild.id}`);

		// Get server settings / if no settings then return
		const settings = messages.first().channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event messageDeleteBulk is for logging
		if (settings.ModLogEvents.includes('MESSAGEDELETEBULK') && settings.ModLog) {
			// Create file of deleted messages
			let humanLog = `**Deleted Messages from #${messages.first().channel.name} (${messages.first().channel.id}) in ${messages.first().guild.name} (${messages.first().guild.id})**`;
			for (const message of messages.array().reverse()) {
				humanLog += `\r\n\r\n[${dateFormat(message.createdAt, 'ddd dd/mm/yyyy HH:MM:ss')}] ${message.author.tag} (${message.id})`;
				humanLog += ' : ' + message.content;
			}
			const attachment = new MessageAttachment(Buffer.from(humanLog, 'utf-8'), 'DeletedMessages.txt');
			// Get modlog channel
			const modChannel = messages.first().guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) {
				const msg = await modChannel.send(attachment);

				// embed
				const embed = new Embed(bot, messages.first().guild.id)
					.setDescription(`**Bulk deleted messages in ${messages.first().channel.toString()}**`)
					.setColor(15158332)
					.setFooter(`Channel: ${messages.first().channel.id}`)
					.setAuthor(messages.first().channel.name, messages.first().guild.iconURL)
					.addField('Message count:', messages.size, true)
					.addField('Deleted Messages:', `[view](https://txt.discord.website/?txt=${modChannel.id}/${msg.attachments.first().id}/DeletedMessages)`, true)
					.setTimestamp();

				bot.addEmbed(modChannel.id, embed);
			}
		}
	}
};
