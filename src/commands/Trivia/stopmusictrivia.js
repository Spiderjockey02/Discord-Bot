module.exports.run = async (bot, message, settings) => {
	if (settings.MusicPlugin == false) return;
	// Check if user is participating in the music trivia
	if (message.guild.me.voiceChannelID !== message.member.voiceChannelID) return message.channel.send('Sorry, you are not connected to the same channel.');
	// Turn off Music trivia
	settings = bot.settings.get(message.guild.id);
	settings.music.musictrivia.active = false;
	bot.settings.set(message.guild.id, settings);
	message.channel.send('Music trivia has ended with the results:');
};
module.exports.config = {
	command: 'stopmusictrivia',
	aliases: ['smt'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'stopmusictrivia',
	category: 'Trivia',
	description: 'Stop the music trivia in your server.',
	usage: '${PREFIX}stopmusictrivia',
};
