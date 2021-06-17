// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ time: { read24hrFormat } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Seek extends Command {
	constructor(bot) {
		super(bot, {
			name: 'seek',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Sets the playing track\'s position to the specified position.',
			usage: 'seek <time>',
			cooldown: 3000,
			examples: ['seek 1:00'],
			slash: true,
			options: [{
				name: 'time',
				description: 'The time you want to seek to.',
				type: 'STRING',
				required: true,
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
		if (!player.queue.current.isSeekable) return message.channel.error('music/seek:LIVSTREAM');

		// Make sure a time was inputted
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/seek:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// update the time
		const time = read24hrFormat((message.args[0]) ? message.args[0] : '10');

		if (time > player.queue.current.duration) {
			message.channel.send(message.translate('music/seek:INVALID', { TIME: new Date(player.queue.current.duration).toISOString().slice(11, 19) }));
		} else {
			player.seek(time);
			const embed = new Embed(bot, message.guild)
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/seek:UPDATED', { TIME: new Date(time).toISOString().slice(14, 19) }));
			message.channel.send(embed);
		}
	}
	async callback(bot, interaction, guild, args) {
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

		// update the time
		time = read24hrFormat(time);

		if (time > player.queue.current.duration) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/seek:INVALID', { TIME: new Date(player.queue.current.duration).toISOString().slice(11, 19) }, true)] });
		} else {
			player.seek(time);
			const embed = new Embed(bot, guild)
				.setColor(member.displayHexColor)
				.setDescription(bot.translate('music/seek:UPDATED', { TIME: new Date(time).toISOString().slice(14, 19) }));
			bot.send(interaction, embed);
		}
	}
};
