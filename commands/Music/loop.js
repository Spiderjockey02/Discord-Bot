module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) return;
	// Check to see if there are any songs in queue/playing
	const fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send('There are currently no songs playing in this server.');
	// Check to see if user and bot are in the same channel
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send('Sorry, you currently aren\'t in the same channel as the bot');
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('loop').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
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
		return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('loop').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
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
	usage: '!loop {song ! queue}',
};
