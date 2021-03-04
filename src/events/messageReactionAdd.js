// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, reaction, user) => {
	// Make sure it's not a BOT and in a guild
	if (user.bot) return;
	if (!reaction.message.guild) return;

	// If reaction needs to be fetched
	if (reaction.message.partial) await reaction.message.fetch();
	if (reaction.partial) await reaction.fetch();

	// Get server settings / if no settings then return
	const settings = reaction.message.channel.guild.settings;
	if (Object.keys(settings).length == 0) return;


	// Check if anti-raid plugin is active
	if (settings.AntiRaidPlugin == true && settings.AntiRaidCompletion == 1) {
		// check if the reaction was done in the #verify channel
		if (reaction.message.channel.id == settings.AntiRaidChannelID) {
			// Make sure its the right emoji as well
			if (reaction._emoji.id == 748984689779540110) {
				// do welcome plugin here
				const member = reaction.message.channel.guild.member(user);
				if (settings.welcomePlugin == true && settings.welcomeRaidConnect == true) {
					const channel = reaction.message.channel.guild.channels.cache.find(c => c.id == settings.welcomeChannel);
					if (channel) channel.send(settings.welcomeMessage.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => bot.logger.error(e.message));
					// Send private message to user
					if (settings.welcomePvt == true) {
						member.send(settings.welcomePvtMessage.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => bot.logger.error(e.message));
					}
					// Add role to user
					if (settings.welcomeRole == true) {
						for (let i = 0; i < settings.welcomeRoleGive.length; i++) {
							if (member.guild.roles.cache.find(role => role.id == settings.welcomeRoleGive[i])) {
								member.roles.add(member.guild.roles.cache.find(role => role.id == settings.welcomeRoleGive[i]));
							}
						}
					}
				} else {
					for (let i = 0; i < settings.welcomeRoleGive.length; i++) {
						if (member.guild.roles.cache.find(role => role.id == settings.welcomeRoleGive[i])) {
							member.roles.add(member.guild.roles.cache.find(role => role.id == settings.welcomeRoleGive[i]));
						}
					}
				}
			}
		}
	}

	// Check if event messageReactionAdd is for logging
	if (settings.ModLogEvents.includes('MESSAGEREACTIONADD') && settings.ModLog) {
		const embed = new MessageEmbed()
			.setDescription(`**${user.toString()} reacted with ${reaction.emoji.toString()} to [this message](${reaction.message.url})** `)
			.setColor(3066993)
			.setFooter(`User: ${user.id} | Message: ${reaction.message.id} `)
			.setAuthor(user.tag, user.displayAvatarURL())
			.setTimestamp();

		// Find channel and send message
		const modChannel = reaction.message.channel.guild.channels.cache.get(settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
	}
};
