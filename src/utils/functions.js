module.exports.checkMusic = (member, bot) => {
	// Check if the member has role to interact with music plugin
	if (member.guild.roles.cache.get(member.guild.settings.MusicDJRole)) {
		if (!member.roles.cache.has(member.guild.settings.MusicDJRole)) {
			return bot.translate('misc:MISSING_ROLE', {}, member.guild.settings.Language);
			// return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
		}
	}

	// Check that a song is being played
	const player = bot.manager.players.get(member.guild.id);
	if (!player) return bot.translate('misc:NO_QUEUE', {}, member.guild.settings.Language); // return message.channel.error('misc:NO_QUEUE').then(m => m.timedDelete({ timeout: 10000 }));

	// Check that user is in the same voice channel
	if (member.voice.channel.id !== player.voiceChannel) return bot.translate('misc:NOT_VOICE', {}, member.guild.settings.Language); // return message.channel.error('misc:NOT_VOICE').then(m => m.timedDelete({ timeout: 10000 }));

	return true;
};
