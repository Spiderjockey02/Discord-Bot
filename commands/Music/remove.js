module.exports.run = async (bot, message, args, emoji, settings, ops) => {
	// Check to see if there are any songs in queue/playing
	const fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send({ embed:{ color:15158332, description:`${emoji} There are currently no songs playing in this server.` } }).then(m => m.delete({ timeout: 5000 }));
	// Check to see if user and bot are in the same channel
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Sorry, you must be in the same voice channel as me` } }).then(m => m.delete({ timeout: 10000 }));
	// Find what to remove
	if (args.length == 0) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('remove').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Position
	if (!isNaN(args[0])) {
		if (args[0] == 0 || args[0] >= fetched.queue.length) return message.channel.send('You');
		// Remove item from queue (also check to make sure args[0] is not greater than queue length and is not current song)
		message.channel.send({ embed:{ color:3066993, description:`${bot.config.emojis.tick} Successfully removed \`${fetched.queue[args[0]].title}\` from queue.` } });
		fetched.queue.splice(args[0], 1);
	} else {
		return message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('remove').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'remove',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'remove',
	category: 'Music',
	description: 'Remove song(s) from the queue',
	usage: '${PREFIX}remove <position>',
};
