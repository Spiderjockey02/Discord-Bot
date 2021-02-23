// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, oldState, newState) => {
	// variables for easier coding
	const newMember = newState.guild.member(newState.id);
	const channel = newState.guild.channels.cache.get(newState.channelID);

	// Get server settings
	const settings = newState.guild.settings;

	// Check if event voiceStateUpdate is for logging
	if (settings.ModLogEvents.includes('VOICESTATEUPDATE') && settings.ModLog) {
		// member has been server (un)deafened
		if (oldState.serverDeaf != newState.serverDeaf) {
			const embed = new MessageEmbed()
				.setDescription(`**${newMember} was server ${newState.serverDeaf ? '' : 'un'}deafened in ${channel.toString()}**`)
				.setColor(newState.serverDeaf ? 15158332 : 3066993)
				.setTimestamp()
				.setFooter(`User: ${newMember.id}`)
				.setAuthor(newMember.user.username, newMember.user.displayAvatarURL);
			const modChannel = newState.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) modChannel.send(embed);
		}

		// member has been server (un)muted
		if (oldState.serverMute != newState.serverMute) {
			const embed = new MessageEmbed()
				.setDescription(`**${newMember} was server ${newState.serverMute ? '' : 'un'}muted in ${channel.toString()}**`)
				.setColor(newState.serverMute ? 15158332 : 3066993)
				.setTimestamp()
				.setFooter(`User: ${newMember.id}`)
				.setAuthor(newMember.user.username, newMember.user.displayAvatarURL);
			const modChannel = newState.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) modChannel.send(embed);
		}

		// member has (stopped/started) streaming
		if (oldState.streaming != newState.streaming) {
			const embed = new MessageEmbed()
				.setDescription(`**${newMember} has ${newState.streaming ? 'started' : 'stopped'} streaming in ${channel.toString()}**`)
				.setColor(newState.streaming ? 15158332 : 3066993)
				.setTimestamp()
				.setFooter(`User: ${newMember.id}`)
				.setAuthor(newMember.user.username, newMember.user.displayAvatarURL);
			const modChannel = newState.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) modChannel.send(embed);
		}
	}
};
