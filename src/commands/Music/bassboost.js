module.exports.run = async (bot, message, args, emojis, settings, ops) => {
	// Check to see if there are any songs in queue/playing
	const fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} There are currently no songs playing in this server.` } }).then(m => m.delete({ timeout: 5000 }));

	// Check to see if user and bot are in the same channel
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Sorry, you must be in the same voice channel as me.` } }).then(m => m.delete({ timeout: 10000 }));

	// Get value for bassboost
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('bassboost').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	if (args[0] < 1 || args[0] >= 75) {
		message.channel.send('Please choose a number from `1 to 75`');
	} else {
		fetched.bassboost = parseInt(args[0]);
		message.channel.send(`Bassboost set to **${args[0]}**.`);
	}
};
module.exports.config = {
	command: 'bassboost',
	aliases: ['bass-boost', 'bb'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'Bassboost',
	category: 'Music',
	description: 'Bassboost a song.',
	usage: '${PREFIX}bassboost <value>',
};
