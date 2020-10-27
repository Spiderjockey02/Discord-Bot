module.exports.run = async (bot, message, args, emojis, settings, ops) => {
	// Leave channel if still in channel (not force kick was used)
	if (message.guild.me.voice.channel) {
		if (message.guild.me.voice.channel !== message.member.voice.channel) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Sorry, you must be in the same voice channel as me.` } }).then(m => m.delete({ timeout: 10000 }));
		message.guild.me.voice.channel.leave();
	}
	// Send messsage
	message.channel.send({ embed:{ color:3066993, description:`${emojis[1]} I have successfully left the channel.` } }).then(m => m.delete({ timeout: 3000 }));
	// Delete the queue for server
	ops.active.delete(message.guild.id);
};
module.exports.config = {
	command: 'leave',
	aliases: ['dc', 'disconnect'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'leave',
	category: 'Music',
	description: 'Leaves the channel',
	usage: '${PREFIX}leave',
};
