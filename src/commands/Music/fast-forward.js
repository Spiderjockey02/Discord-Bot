// function to convert 1:00 to 60 * 1000 milliseconds
function hmsToSecondsOnly(str) {
	const p = str.split(':');
	let s = 0, m = 1;

	while (p.length > 0) {
		s = +m * parseInt(p.pop(), 10);
		m = m * 60;
	}
	return s;
}
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Check that a song is being played
	const player = bot.manager.players.get(message.guild.id);
	if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

	// Check that user is in the same voice channel
	if (message.member.voice.channel.id !== player.voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

	// update the time
	const time = hmsToSecondsOnly(args[0]) * 1000;
	if (time + player.position >= player.queue.current.duration) {
		message.channel.send(`The song is only ${new Date(player.queue.current.duration).toISOString().slice(14, 19)}.`);
	} else {
		player.seek(player.position + time);
		const embed = new MessageEmbed()
			.setColor(message.member.displayHexColor)
			.setDescription(message.translate(settings.Language, 'MUSIC/TIME_MOVED', new Date(player.position).toISOString().slice(14, 19)));
		message.channel.send(embed);
	}
};

module.exports.config = {
	command: 'fast-forward',
	aliases: ['ffw', 'fastforward'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'Fast forward',
	category: 'Music',
	description: 'Fast forwards the player by your specified amount.',
	usage: '${PREFIX}fast-forward <time>',
};
