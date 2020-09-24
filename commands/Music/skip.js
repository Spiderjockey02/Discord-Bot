module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) return;
	// Check to see if there are any songs in queue/playing
	const fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send('There are currently no songs playing in this server.');
	// Check to see if user and bot are in the same channel
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send('Sorry, you currently aren\'t in the same channel as the bot');
	// Run finish event and return
	if (args[0]) {
		if (args[0] < 1 || args[0] >= fetched.queue.length) {
			message.channel.send(`Please choose a number from \`1 to ${fetched.queue.length}\``);
		} else {
			fetched.queue.splice(0, args[0] - 1);
			fetched.dispatcher.end();
		}
		fetched.connection.dispatcher.emit('finish');
	} else {
		fetched.connection.dispatcher.emit('finish');
	}
};
module.exports.config = {
	command: 'skip',
	aliases: ['skip'],
};
module.exports.help = {
	name: 'skip',
	category: 'Music',
	description: 'Skips the current song. (Votes needed)',
	usage: '!skip [position - optional]',
};
