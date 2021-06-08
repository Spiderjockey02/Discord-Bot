// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Pause extends Command {
	constructor(bot) {
		super(bot, {
			name: 'pause',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Pauses the music.',
			usage: 'pause',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.channel.error('misc:NO_QUEUE').then(m => m.timedDelete({ timeout: 10000 }));

		// Check that user is in the same voice channel
		if (message.member.voice.channel.id !== player.voiceChannel) return message.channel.error('misc:NOT_VOICE').then(m => m.timedDelete({ timeout: 10000 }));

		// The music is already paused
		if (player.paused) return message.channel.error('music/pause:IS_PAUSED', { PREFIX: settings.prefix });

		// Pauses the music
		player.pause(true);
		return message.channel.success('music/pause:SUCCESS');
	}
	async callback(bot, interaction, guild) {
		// Check if the member has role to interact with music plugin
		const member = guild.members.cache.get(interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelID);
		const amount = args.get('amount').value;

		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { ERROR: null }, true)] })		
			}
		}

		// Check that a song is being played
		const player = bot.manager.players.get(guild.id);
		if(!player) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NO_QUEUE', { ERROR: null }, true)] })

		// Check that user is in the same voice channel
		if (member.voice.channel.id !== player.voiceChannel) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NOT_VOICE', { ERROR: null }, true)] })
	
		// The music is already paused
		if (player.paused) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/pause:IS_PAUSED', { ERROR: null }, true)] })

		// Pauses the music
		player.pause(true);
		return interaction.reply({ ephemeral: false, embeds: [channel.success('music/pause:SUCCESS', { ARGS: null }, true)] })
	}
};
