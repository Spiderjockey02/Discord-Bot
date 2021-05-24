// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Disconnect extends Command {
	constructor(bot) {
		super(bot, {
			name: 'dc',
			dirname: __dirname,
			aliases: ['stop', 'disconnect'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Disconnects the bot from the voice channel.',
			usage: 'dc',
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
		if (!player) return message.channel.error('misc:NO_QUEUE').then(m => m.delete({ timeout: 10000 }));

		// Check that user is in the same voice channel
		if (message.member.voice.channel.id !== player.voiceChannel) return message.channel.error('misc:NOT_VOICE').then(m => m.delete({ timeout: 10000 }));

		// Destory player (clears queue & leaves channel)
		player.destroy();
		return message.channel.success('music/dc:LEFT');
	}
};
