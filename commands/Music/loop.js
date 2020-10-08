module.exports.run = async (bot, message, args, emojis, settings, ops) => {
	// Check to see if there are any songs in queue/playing
	const fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} There are currently no songs playing in this server.` } }).then(m => m.delete({ timeout: 5000 }));
	// Check to see if user and bot are in the same channel
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Sorry, you currently aren't in the same channel as the bot.` } }).then(m => m.delete({ timeout: 5000 }));
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('loop').help.usage.replace('${PREFIX}')}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	if (args[0].toLowerCase() == 'song') {
		// Loop song
		fetched.loopSong = !fetched.loopSong;
		return message.channel.send(`Loop is now ${fetched.loopSong ? '**on**' : '**off**'}`);
	} else if (args[0].toLowerCase() == 'queue') {
		// Loop queue
		fetched.loopQueue = !fetched.loopQueue;
		return message.channel.send(`Loop is now ${fetched.loopQueue ? '**on**' : '**off**'}`);
	} else {
		// reponse was not queue or song
		return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('loop').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	}
};
module.exports.config = {
	command: 'loop',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'Loop',
	category: 'Music',
	description: '(un)Loop the queue',
	usage: '${PREFIX}loop <song | queue>',
};
