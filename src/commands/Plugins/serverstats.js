module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can edit server plugins
	if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

	// Check to see if user dosesn't know how to use command or not
	if (!args[0] | args[0] == '?') return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('serverstats').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));


	if (args[0] == 'on') {
		await message.guild.channels.create('📊 Server Stats 📊', { type: 'category', reason: 'Server stats set-up' }).then(async channel => {
			// add bot channel
			const botChannel = await message.guild.channels.create(`Bot count: ${message.guild.members.cache.filter(m => m.user.bot).size}`, { type: 'voice' });
			botChannel.setParent(channel.id);
			// add user channel
			const userChannel = await message.guild.channels.create(`User count: ${message.guild.members.cache.size}`, { type: 'voice' });
			userChannel.setParent(channel.id);
			// add human channel
			const humanChannel = await message.guild.channels.create(`Human count: ${message.guild.members.cache.filter(m => !m.user.bot).size}`, { type: 'voice' });
			humanChannel.setParent(channel.id);
			bot.updateGuild(message.guild, { ServerStats: true, ServerStatsCate: channel.id, ServerStatsBot: true, ServerStatsBotChannel: botChannel.id, ServerStatsUser: true, ServerStatsUserChannel: userChannel.id, ServerStatsHuman: true, ServerStatsHumanChannel: humanChannel.id });
		});
	} else {
		const botChannel = message.guild.channels.cache.find(c => c.id == settings.ServerStatsBotChannel);
		if (botChannel) botChannel.delete();
		const userChannel = message.guild.channels.cache.find(c => c.id == settings.ServerStatsUserChannel);
		if (userChannel) userChannel.delete();
		const humanChannel = message.guild.channels.cache.find(c => c.id == settings.ServerStatsHumanChannel);
		if (humanChannel) humanChannel.delete();
		const cateChannel = message.guild.channels.cache.find(c => c.id == settings.ServerStatsCate);
		if (cateChannel) cateChannel.delete();
		bot.updateGuild(message.guild, { ServerStats: false, ServerStatsCate: '00', ServerStatsBot: false, ServerStatsBotChannel: '00', ServerStatsUser: false, ServerStatsUserChannel: '00', ServerStatsHuman: false, ServerStatsHumanChannel: '00' });
	}
};

module.exports.config = {
	command: 'serverstats',
	aliases: ['server-stats'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'serverstats',
	category: 'Plugins',
	description: 'Turn on or off the serverstats.',
	usage: '${PREFIX}serverstats <on | off>',
};
