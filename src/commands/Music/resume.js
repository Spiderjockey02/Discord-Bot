module.exports.run = async (bot, message, args, emojis, settings, ops) => {
	// Check to see if there are any songs in queue/playing
	const fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} There are currently no songs playing in this server.` } }).then(m => m.delete({ timeout: 5000 }));
	// Check to see if user and bot are in the same channel
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Sorry, you must be in the same voice channel as me` } }).then(m => m.delete({ timeout: 10000 }));
	// Check to see if bot is already paused or not
	if (!fetched.connection.dispatcher.paused) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am already playing, \`!pause\` to pause song.` } }).then(m => m.delete({ timeout: 10000 }));
	// And if not resume the music
	fetched.connection.dispatcher.resume();
	message.channel.send(`Successfully resumed ${fetched.queue[0].title}`);
};
module.exports.config = {
	command: 'resume',
	aliases: ['res'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'resume',
	category: 'Music',
	description: 'Resume the music.',
	usage: '${PREFIX}resume',
};
