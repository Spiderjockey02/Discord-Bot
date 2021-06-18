// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Move extends Command {
	constructor(bot) {
		super(bot, {
			name: 'move',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Moves the specified song to the specified position.',
			usage: 'move <position> <new position>',
			cooldown: 3000,
			examples: ['move 4 8'],
			slash: true,
			options: [{
				name: 'position',
				description: 'The initial position of the song.',
				type: 'INTEGER',
				required: true,
			},
			{
				name: 'newposition',
				description: 'The new position of the song.',
				type: 'INTEGER',
				required: false,
			}],
		});
	}

	// Function for message command
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

		// Make sure positions are number(s)
		if (isNaN(message.args[0])) return message.channel.send(message.translate('music/move:INVALID'));

		// Can't move currently playing song
		if (message.args[0] === 0) return message.channel.send(message.translate('music/move:IS_PLAYING', { PREFIX: settings.prefix }));

		// Make sure number is position in the queue
		if ((message.args[0] > player.queue.length) || (message.args[0] && !player.queue[message.args[0]])) return message.channel.send(message.translate('music/move:NOT_FOUND'));

		if (!message.args[1]) {
			const song = player.queue[message.args[0] - 1];
			player.queue.splice(message.args[0] - 1, 1);
			player.queue.splice(0, 0, song);
			return message.channel.send(message.translate('music/move:MOVED_1', { TITLE: song.title }));
		} else if (message.args[1]) {
			if (message.args[1] == 0) return message.channel.send(message.translate('music/move:IS_PLAYING', { PREFIX: settings.prefix }));
			if ((message.args[1] > player.queue.length) || !player.queue[message.args[1]]) return message.channel.send(message.translate('music/move:NOT_FOUND'));
			const song = player.queue[message.args[0] - 1];
			player.queue.splice(message.args[0] - 1, 1);
			player.queue.splice(message.args[1] - 1, 0, song);
			return message.channel.send(message.translate('music/move:MOVED_1', { TITLE: song.title, POS: message.args[1] }));
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		// Check if the member has role to interact with music plugin
		const member = guild.members.cache.get(interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelID);

		const pos1 = args.get('position').value;
		const pos2 = args.get('newposition').value;

		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { ERROR: null }, true)] });
			}
		}
		// Check that a song is being played
		const player = bot.manager.players.get(guild.id);
		if(!player) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NO_QUEUE', { ERROR: null }, true)] });

		// Check that user is in the same voice channel
		if (message.member.voice.channel.id !== player.voiceChannel) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NOT_VOICE', { ERROR: null }, true)] });

		if (pos1 === 0) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/move:IS_PLAYING', { PREFIX: guild.settings.prefix }, true)] });

		if ((pos1 > player.queue.length) || (pos1 && !player.queue[pos1])) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/move:NOT_FOUND', { ERROR: null }, true)] });


		if (!pos2) {
			const song = player.queue[pos1 - 1];
			player.queue.splice(pos1 - 1, 1);
			player.queue.splice(0, 0, song);
			return await bot.send(interaction, bot.translate('music/move:MOVED_1', { TITLE: song.title }));
		} else if (pos2) {
			if (pos2 == 0) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/move:IS_PLAYING', { PREFIX: guild.settings.prefix }, true)] });
			if ((pos2 > player.queue.length) || !player.queue[pos2]) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/move:NOT_FOUND', { ERROR: null }, true)] });
			const song = player.queue[pos1 - 1];
			player.queue.splice(pos1 - 1, 1);
			player.queue.splice(pos2 - 1, 0, song);
			return await bot.send(interaction, bot.translate('music/move:MOVED_1', { TITLE: song.title, POS: pos2 }));
		}
	}
};
