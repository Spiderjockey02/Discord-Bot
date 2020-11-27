// Dependecies
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Check that a song is being played
	const player = bot.manager.players.get(message.guild.id);
	if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

	// Make sure the user is in a voice channel
	if (!message.member.voice.channel) return message.error(settings.Language, 'MUSIC/MISSING_VOICE');

	// Check if bot has permission to connect to voice channel
	if (!message.member.voice.channel.permissionsFor(message.guild.me).has('CONNECT')) {
		bot.logger.error(`Missing permission: \`CONNECT\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'CONNECT').then(m => m.delete({ timeout: 10000 }));
	}

	// Check if bot has permission to speak in the voice channel
	if (!message.member.voice.channel.permissionsFor(message.guild.me).has('SPEAK')) {
		bot.logger.error(`Missing permission: \`SPEAK\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'SPEAK').then(m => m.delete({ timeout: 10000 }));
	}

	// Move the bot to the new voice channel
	try {
		await player.setVoiceChannel(message.member.voice.channel.id);
		const embed = new MessageEmbed()
			.setColor(message.member.displayHexColor)
			.setDescription(message.translate(settings.Language, 'MUSIC/CHANNEL_MOVE'));
		message.channel.send(embed);
	} catch (e) {
		console.log(e);
	}
};

module.exports.config = {
	command: 'join',
	aliases: ['movehere'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'Join',
	category: 'Music',
	description: 'Makes the bot join your voice channel.',
	usage: '${PREFIX}join',
};
