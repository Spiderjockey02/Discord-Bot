// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Skip extends Command {
	constructor(bot) {
		super(bot, {
			name:  'skip',
			dirname: __dirname,
			aliases: ['next', 'skipto'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Skips the current song.',
			usage: 'skip',
			cooldown: 3000,
			slash: true,
			options: [{
				name: 'amount',
				description: 'The amount of songs you want to skip.',
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

		// skip song
		if (!isNaN(message.args[0]) && message.args[0] < player.queue.length) {
			player.stop(parseInt(message.args[0]));
		} else {
			player.stop();
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		// Check if the member has role to interact with music plugin
		const member = guild.members.cache.get(interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelID);
		const amount = args.get('amount').value;

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

		// skip song
		if (amount < player.queue.length) {
			player.stop(amount);
		} else {
			player.stop();
		}
	}
};
