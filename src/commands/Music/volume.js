// Dependecies
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Check that a song is being played
	const player = bot.manager.players.get(message.guild.id);
	if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

	// Check that user is in the same voice channel
	if (message.member.voice.channel.id !== player.voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

	// Make sure a number was entered
	if (!args[0]) {
		const embed = new MessageEmbed()
			.setColor(message.member.displayHexColor)
			.setDescription(message.translate(settings.Language, 'MUSIC/SOUND_CURRENT', player.volume));
		return message.channel.send(embed);
	}

	// make sure the number was between 0 and 100
	if (Number(args[0]) <= 0 || Number(args[0]) > 100) {
		return message.error(settings.Language, 'MUSIC/TOO_HIGH');
	}

	// Update volume
	player.setVolume(Number(args));
	const embed = new MessageEmbed()
		.setColor(message.member.displayHexColor)
		.setDescription(message.translate(settings.Language, 'MUSIC/SOUND_SET', player.volume));
	return message.channel.send(embed);
};

module.exports.config = {
	command: 'volume',
	aliases: ['vol'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'volume',
	category: 'Music',
	description: 'Changes the volume of the song',
	usage: '${PREFIX}volume <Number>',
};
