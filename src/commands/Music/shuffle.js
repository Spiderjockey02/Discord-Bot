module.exports.run = async (bot, message, args, emojis, settings, ops) => {
	// Get queue
	const fetched = ops.active.get(message.guild.id);
	if (fetched == undefined) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} There are currently no songs playing in this server.` } }).then(m => m.delete({ timeout: 5000 }));
	// variables
	const songs = fetched.queue;
	for (let i = songs.length - 1; i > 1; i--) {
		const j = 1 + Math.floor(Math.random() * i);
		[songs[i], songs[j]] = [songs[j], songs[i]];
	}
	fetched.queue = songs;
	ops.active.set(message.guild.id, fetched);
	// send message
	message.channel.send('Queue has been shuffled').then(m => m.delete({ timeout: 5000 }));
};
module.exports.config = {
	command: 'shuffle',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};
module.exports.help = {
	name: 'shuffle',
	category: 'Music',
	description: 'Shuffles up the queue',
	usage: '${PREFIX}shuffle',
};
