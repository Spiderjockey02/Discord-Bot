module.exports.run = async (bot, message, args, settings) => {
	if (settings.MusicPlugin == false) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:'<:Cross:748984863432114266> This plugin is currently disabled.' } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
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
	description: 'Stops the music trivia in your server',
	usage: '!stopmusictrivia',
};
