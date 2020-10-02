module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) return;
	// Check to see if any songs are playing
	const fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} There are currently no songs playing in this server.` } }).then(m => m.delete({ timeout: 5000 }));
	// Check to see if user is in the same channel as the bot
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Sorry, you must be in the same voice channel as me` } }).then(m => m.delete({ timeout: 10000 }));
	// Check to see if anythign else was entered with the command
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('skipto').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Get position
	if (args[0] < 1 || args[0] >= fetched.queue.length) {
		message.channel.send(`Please choose a number from \`1 to ${fetched.queue.length}\``);
	} else {
		fetched.queue.splice(0, args[0] - 1);
		fetched.dispatcher.end();
	}
};
module.exports.config = {
	command: 'skipto',
	aliases: ['goto', 'jump'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'skipto',
	category: 'Music',
	description: 'Skips to a particular song in the queue.',
	usage: '!skipto [position]',
};
