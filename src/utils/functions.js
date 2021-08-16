module.exports.checkMusic = (member, bot) => {
	// Check if the member has role to interact with music plugin
	if (member.guild.roles.cache.get(member.guild.settings.MusicDJRole)) {
		if (!member.roles.cache.has(member.guild.settings.MusicDJRole)) {
			return bot.translate('misc:MISSING_ROLE', {}, member.guild.settings.Language);
		}
	}

	// Check that a song is being played
	const player = bot.manager?.players.get(member.guild.id);
	if (!player) return bot.translate('misc:NO_QUEUE', {}, member.guild.settings.Language);

	// Check that user is in the same voice channel
	if (member.voice.channel.id !== player.voiceChannel) return bot.translate('misc:NOT_VOICE', {}, member.guild.settings.Language);

	return true;
};

module.exports.checkNSFW = (channel) => {
	return channel.nsfw || channel.type == 'DM';
};

module.exports.genInviteLink = (bot) => {
	return bot.generateInvite({
		permissions: BigInt(1073081686),
		scopes: ['bot', 'applications.commands'] });
};
