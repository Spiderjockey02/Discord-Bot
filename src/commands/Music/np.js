// Dependecies
const { MessageEmbed } = require('discord.js');
const createBar = require('string-progressbar');

module.exports.run = async (bot, message, args, settings) => {
	// Check that a song is being played
	const player = bot.manager.players.get(message.guild.id);
	if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

	// Get current song information
	const { title, requester, thumbnail, uri, duration } = player.queue.current;

	// Display current song information
	const embed = new MessageEmbed()
		.setAuthor('Now playing:')
		.setColor(message.member.displayHexColor)
		.setThumbnail(thumbnail)
		.setDescription(`[${title}](${uri}) [${message.guild.member(requester)}]`)
		.addField('\u200b', new Date(player.position).toISOString().slice(14, 19) + ' [' + createBar(duration == 0 ? player.position : duration, player.position, 15)[0] + '] ' + new Date(duration).toISOString().slice(14, 19), false);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'np',
	aliases: ['song'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'Now playing',
	category: 'Music',
	description: 'Shows the current song playing.',
	usage: '${PREFIX}np',
};
