const { ChannelType } = require('discord-api-types/v10');

module.exports = {
	checkMusic: function(member, bot) {
		// Check that a song is being played
		const player = bot.manager?.players.get(member.guild.id);
		if (!player) return member.guild.translate('misc:NO_QUEUE');

		// Check that user is in the same voice channel
		if (member.voice?.channel?.id !== player.voiceChannel) return member.guild.translate('misc:NOT_VOICE');

		// Check if the member has role to interact with music plugin
		if (member.guild.roles.cache.get(member.guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(member.guild.settings.MusicDJRole)) {
				return member.guild.translate('misc:MISSING_ROLE');
			}
		}
		return true;
	},
	checkNSFW: function(channel) {
		return channel.nsfw || channel.type == ChannelType.DM;
	},
	CalcLevenDist: function(str1 = '', str2 = '') {
		const track = Array(str2.length + 1).fill(null).map(() =>
			Array(str1.length + 1).fill(null));
		for (let i = 0; i <= str1.length; i += 1) {
			track[0][i] = i;
		}
		for (let j = 0; j <= str2.length; j += 1) {
			track[j][0] = j;
		}
		for (let j = 1; j <= str2.length; j += 1) {
			for (let i = 1; i <= str1.length; i += 1) {
				const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
				track[j][i] = Math.min(
					track[j][i - 1] + 1,
					track[j - 1][i] + 1,
					track[j - 1][i - 1] + indicator,
				);
			}
		}
		return track[str2.length][str1.length];
	},
};
