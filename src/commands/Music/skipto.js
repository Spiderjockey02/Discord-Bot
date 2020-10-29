module.exports.run = async (bot, message, args, emojis, settings, ops) => {
	// Check to see if any songs are playing
	const fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} There are currently no songs playing in this server.` } }).then(m => m.delete({ timeout: 5000 }));
	// Check to see if user is in the same channel as the bot
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Sorry, you must be in the same voice channel as me` } }).then(m => m.delete({ timeout: 10000 }));
	// Check to see if anythign else was entered with the command
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('skipto').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
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
	description: 'Skip to a song in the queue.',
	usage: '${PREFIX}skipto <position>',
};
