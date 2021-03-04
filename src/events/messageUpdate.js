// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, oldMessage, newMessage) => {
	// make sure its not a DM
	if (newMessage.channel.type == 'dm') return;

	// Check if message is a partial
	if (oldMessage.partial || newMessage.partial) return;

	// only check for message content is different
	if (oldMessage.content == newMessage.content) return;

	// Get server settings / if no settings then return
	const settings = newMessage.guild.settings;
	if (Object.keys(settings).length == 0) return;

	// Check if ModLog plugin is active
	if (settings.ModLog == false) return;

	// Check if event channelDelete is for logging
	if (settings.ModLogEvents.includes('MESSAGEUPDATE')) {
		// shorten both messages when the content is larger then 1024 chars
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
		const embed = new MessageEmbed()
			.setDescription(`**Message of ${newMessage.author.toString()} edited in ${newMessage.channel.toString()}** [Jump to Message](${newMessage.url})`)
			.setFooter(`Author: ${newMessage.author.id} | Message: ${newMessage.id}`)
			.setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL())
			.addFields(
				{ name: `Before ${(oldShortened ? ' (shortened)' : '')}:`, value: `${oldMessage.content.length > 0 ? oldContent : '*empty message*'}`, inline: true },
				{ name: `After ${(newShortened ? ' (shortened)' : '')}:`, value: `${newMessage.content.length > 0 ? newContent : '*empty message*'}`, inline: true })
			.setTimestamp();
		// send message
		const modChannel = newMessage.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
		// Log event to console
		bot.logger.log(`Message by: ${newMessage.author.username} has been updated in server: [${newMessage.guild.id}]`);
	}
};
