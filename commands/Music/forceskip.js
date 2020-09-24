module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) return;
	// Check to see if there are any songs in queue/playing
	const fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send('There are currently no songs playing in this server.');
	// Check to see if user and bot are in the same channel
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send('Sorry, you currently aren\'t in the same channel as the bot');
};
module.exports.config = {
	command: 'foreceskip',
	aliases: ['fskip', 'force-skip'],
};
module.exports.help = {
	name: 'force skip',
	category: 'Music',
	description: 'Force skips a song',
	usage: '!forceskip [position - optional]',
};
