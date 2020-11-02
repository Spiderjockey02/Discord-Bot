// Dependencies
const dateFormat = require('dateformat');
const { MessageAttachment, MessageEmbed } = require('discord.js');

module.exports = async (bot, messages) => {
	// Get server settings
	let settings;
	try {
		settings = await bot.getGuild(messages.first().channel.guild);
	} catch (e) {
		console.log(e);
	}
	// Check if ModLog plugin is active
	if (settings.ModLog == false) return;
	// Check if event channelDelete is for logging
	if (settings.ModLogEvents.includes('MESSAGEDELETEBULK')) {
		let humanLog = `**Deleted Messages from #${messages.first().channel.name} (${messages.first().channel.id}) in ${messages.first().guild.name} (${messages.first().guild.id})**`;
		for (const message of messages.array().reverse()) {
			humanLog += `\r\n\r\n[${dateFormat(message.createdAt, 'ddd dd/mm/yyyy HH:MM:ss')}] ${message.author.tag} (${message.id})`;
			humanLog += ' : ' + message.content;
		}
		const modChannel = messages.first().channel.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
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
		// log event in console
		bot.logger.log(`[${messages.size}] messages were deleted in server [${messages.first().channel.guild.id}].`);
	}
};
