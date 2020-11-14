module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) return;
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
	description: 'Start a music trivia for your server.',
	usage: '${PREFIX}startmusictrivia [genre]',
};
