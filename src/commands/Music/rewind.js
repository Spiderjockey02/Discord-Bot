// Dependencies
const { Embed } = require('../../utils'),
	{ time: { read24hrFormat, getReadableTime } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Rewind extends Command {
	constructor(bot) {
		super(bot, {
			name: 'rewind',
			dirname: __dirname,
			aliases: ['rw'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Rewinds the player by your specified amount.',
			usage: 'rewind <time>',
			cooldown: 3000,
			examples: ['rw 1:00', 'rw 1:32:00'],
			slash: true,
			options: [{
				name: 'time',
				description: 'The time you want to rewind to.',
				type: 'STRING',
				required: false,
			}],
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

		// Make sure song isn't a stream
		if (!player.queue.current.isSeekable) return message.channel.error('music/rewind:LIVESTREAM');

		// update the time
		const time = read24hrFormat((message.args[0]) ? message.args[0] : '10');

		if (time + player.position <= 0) {
			message.channel.send(message.translate('music/rewind:INVALID'));
		} else {
			player.seek(player.position - time);
			const embed = new Embed(bot, message.guild)
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/rewind:NEW_TIME', { NEW: new Date(player.position).toISOString().slice(14, 19), OLD: getReadableTime(time) }));
			message.channel.send(embed);
		}
	}
	async callback(bot, interaction, guild) {
		// Check if the member has role to interact with music plugin
		const member = guild.members.cache.get(interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelID);
		const time = args.get('time').value;

		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { ERROR: null }, true)] });
			}
		}

		// Check that a song is being played
		const player = bot.manager.players.get(guild.id);
		if(!player) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NO_QUEUE', { ERROR: null }, true)] });

		// Check that user is in the same voice channel
		if (member.voice.channel.id !== player.voiceChannel) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NOT_VOICE', { ERROR: null }, true)] });

		// Make sure song isn't a stream
		if (!player.queue.current.isSeekable) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/rewind:LIVESTREAM', { ERROR: null }, true)] });

		// update the time
		const time = read24hrFormat((time) ? time : '10');

		if (time + player.position <= 0) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/rewind:INVALID', { ERROR: null }, true)] });
		} else {
			player.seek(player.position - time);
			const embed = new Embed(bot, guild)
				.setColor(member.displayHexColor)
				.setDescription(bot.translate('music/rewind:NEW_TIME', { NEW: new Date(player.position).toISOString().slice(14, 19), OLD: getReadableTime(time) }));
			bot.send(interaction, embed);
		}
	}
};
