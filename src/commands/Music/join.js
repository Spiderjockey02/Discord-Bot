// Dependecies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Join extends Command {
	constructor(bot) {
		super(bot, {
			name: 'join',
			dirname: __dirname,
			aliases: ['movehere'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
			description: 'Makes the bot join your voice channel.',
			usage: 'join',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.error(settings.Language, 'MUSIC/MISSING_DJROLE').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		let player = bot.manager.players.get(message.guild.id);

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

		// If no player (no song playing) create one and join channel
		if (!player) {
			try {
				player = bot.manager.create({
					guild: message.guild.id,
					voiceChannel: message.member.voice.channel.id,
					textChannel: message.channel.id,
					selfDeafen: true,
				});
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
			player.connect();
		} else {
			// Move the bot to the new voice channel / update text channel
			try {
				await player.setVoiceChannel(message.member.voice.channel.id);
				await player.setTextChannel(message.channel.id);
				const embed = new MessageEmbed()
					.setColor(message.member.displayHexColor)
					.setDescription(message.translate(settings.Language, 'MUSIC/CHANNEL_MOVE'));
				message.channel.send(embed);
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
		}
	}
};
