// Dependencies
const dateFormat = require('dateformat');
const { MessageAttachment, MessageEmbed } = require('discord.js');

module.exports = async (bot, messages) => {
	// Get server settings / if no settings then return
	const settings = messages.first().channel.guild.settings;
	if (Object.keys(settings).length == 0) return;

	// Check if event messageDeleteBulk is for logging
	if (settings.ModLogEvents.includes('MESSAGEDELETEBULK') && settings.ModLog) {
		let humanLog = `**Deleted Messages from #${messages.first().channel.name} (${messages.first().channel.id}) in ${messages.first().guild.name} (${messages.first().guild.id})**`;
		for (const message of messages.array().reverse()) {
			humanLog += `\r\n\r\n[${dateFormat(message.createdAt, 'ddd dd/mm/yyyy HH:MM:ss')}] ${message.author.tag} (${message.id})`;
			humanLog += ' : ' + message.content;
		}
		//
		const modChannel = messages.first().channel.guild.channels.cache.get(settings.ModLogChannel);
		if (modChannel) {
			const attachment = new MessageAttachment(Buffer.from(humanLog, 'utf-8'), 'DeletedMessages.txt');
			const msg = await modChannel.send(attachment);
			// embed
			const embed = new MessageEmbed()
				.setDescription(`**Bulk deleted messages in ${messages.first().channel.toString()}**`)
				.setColor(15158332)
				.setFooter(`Channel: ${messages.first().channel.id}`)
				.setAuthor(messages.first().channel.name, messages.first().guild.iconURL)
				.addField('Message count:', messages.size, true)
				.addField('Deleted Messages:', `[view](https://txt.discord.website/?txt=${modChannel.id}/${msg.attachments.first().id}/DeletedMessages)`, true)
				.setTimestamp();
			modChannel.send(embed);
		}
	}
};
