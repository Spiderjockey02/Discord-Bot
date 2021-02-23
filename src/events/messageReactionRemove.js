// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, reaction, user) => {
	// make sure it dosen't happen in a DM
	if (reaction.message.channel.type == 'dm') return;

	// Make sure it's not a BOT
	if (user.bot) return;

	// Get server settings
	const settings = reaction.message.channel.guild.settings;

	// Check if event messageReactionRemove is for logging
	if (settings.ModLogEvents.includes('MESSAGEREACTIONREMOVE') && settings.ModLog) {
		const embed = new MessageEmbed()
			.setDescription(`**${user.toString()} unreacted with ${reaction.emoji.toString()} to [this message](${reaction.message.url})** `)
			.setColor(15158332)
			.setFooter(`User: ${user.id} | Message: ${reaction.message.id} `)
			.setAuthor(user.tag, user.displayAvatarURL())
			.setTimestamp();

		// Find channel and send message
		const modChannel = reaction.message.channel.guild.channels.cache.get(settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
	}
};
