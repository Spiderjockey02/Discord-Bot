// Dependecies
const { Embed } = require('../../utils'),
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
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);

		// Make sure the user is in a voice channel
		if (!message.member.voice.channel) return message.channel.error('music/join:NO_VC');

		// If no player (no song playing) create one and join channel
		if (!player) {
			try {
				await bot.manager.create({
					guild: message.guild.id,
					voiceChannel: message.member.voice.channel.id,
					textChannel: message.channel.id,
					selfDeafen: true,
				}).connect();
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		} else {
			// Move the bot to the new voice channel / update text channel
			try {
				await player.setVoiceChannel(message.member.voice.channel.id);
				await player.setTextChannel(message.channel.id);
				const embed = new Embed(bot, message.guild)
					.setColor(message.member.displayHexColor)
					.setDescription(message.translate('music/join:MOVED'));
				message.channel.send(embed);
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		}
	}
};
