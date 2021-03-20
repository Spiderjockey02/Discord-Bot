// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, oldState, newState) => {
	// variables for easier coding
	const newMember = newState.guild.member(newState.id);
	const channel = newState.guild.channels.cache.get(newState.channelID);

	// Get server settings / if no settings then return
	const settings = newState.guild.settings;
	if (Object.keys(settings).length == 0) return;

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


	// Only keep the bot in the voice channel by its self for 3 minutes
	const player = bot.manager.players.get(newState.guild.id);

	if (!player) return;
	if (!newState.guild.members.cache.get(bot.user.id).voice.channelID) player.destroy();
	if (oldState.id === bot.user.id) return;
	if (!oldState.guild.members.cache.get(bot.user.id).voice.channelID) return;

	// Make sure the bot is in the voice channel that 'activated' the event
	if (oldState.guild.members.cache.get(bot.user.id).voice.channel.id === oldState.channelID) {
		if (oldState.guild.voice.channel && oldState.guild.voice.channel.members.filter(m => !m.user.bot).size === 0) {
			const vcName = oldState.guild.me.voice.channel.name;
			const embed = new MessageEmbed()
				.setDescription(`Leaving 🔉 **${vcName}** in ${180000 / 1000} seconds because I was left alone.`);
			const c = bot.channels.cache.get(player.textChannel);
			let msg;
			if (c) {
				try {
					msg = await c.send(embed);
				} catch (err) {
					bot.logger.error(err.message);
				}
			}
			const delay = ms => new Promise(res => setTimeout(res, ms));
			await delay(180000);

			const vcMembers = oldState.guild.voice.channel.members.size;
			if (!vcMembers || vcMembers === 1) {
				const newPlayer = bot.manager.players.get(newState.guild.id);
				(newPlayer) ? player.destroy() : oldState.guild.voice.channel.leave();

				const embed2 = new MessageEmbed()
					.setDescription(`I left 🔉 **${vcName}** because I was left alone.`);
				try {
					return msg.edit(embed2, '').then(m => m.delete({ timeout: 15000 }));
				} catch (err) {
					bot.logger.error(err.message);
				}
			} else {
				return msg.delete();
			}
		}
	}
};
