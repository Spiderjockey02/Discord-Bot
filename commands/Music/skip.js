module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) return;
	// Check to see if there are any songs in queue/playing
	const fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} There are currently no songs playing in this server.` } }).then(m => m.delete({ timeout: 5000 }));
	// Check to see if user and bot are in the same channel
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Sorry, you must be in the same voice channel as me` } }).then(m => m.delete({ timeout: 10000 }));
	// Run finish event and return
	if (args[0]) {
		if (args[0] < 1 || args[0] >= fetched.queue.length) {
			return message.channel.send(`Please choose a number from \`1 to ${fetched.queue.length}\``);
		} else {
			fetched.queue.splice(0, args[0] - 1);
			fetched.dispatcher.end();
		}
	}
	fetched.connection.dispatcher.emit('finish');
};
module.exports.config = {
	command: 'skip',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'skip',
	category: 'Music',
	description: 'Skips the current song. (Votes needed)',
	usage: '!skip [position - optional]',
};
