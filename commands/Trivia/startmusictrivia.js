module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:'<:Cross:748984863432114266> This plugin is currently disabled.' } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// If there is music currently playing stop it, clear queue and leave call to prepare for music trivia
	const fetched = ops.active.get(message.guild.id) || {};
	console.log(fetched);
	if (fetched.size == 0) {
		fetched.queue.splice(0, fetched.queue.length);
		message.guild.me.voiceChannel.leave();
	}
	// Turn on Music trivia
	settings = bot.settings.get(message.guild.id);
	settings.music.musictrivia.active = true;
	bot.settings.set(message.guild.id, settings);
	message.channel.send('Music trivia has started.');
};
module.exports.config = {
	command: 'startmusictrivia',
	aliases: ['smt'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'startmusictrivia',
	category: 'Trivia',
	description: 'Starts a music trivia for your server.',
	usage: '!startmusictrivia [genre - optional]',
};
