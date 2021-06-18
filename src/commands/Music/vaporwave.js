// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Vaporwave extends Command {
	constructor(bot) {
		super(bot, {
			name: 'vaporwave',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Toggles vaporwave mode.',
			usage: 'vaporwave',
			cooldown: 3000,
			examples: ['vaporwave off'],
			slash: true,
			options: [{
				name: 'amount',
				description: 'The amount you want to vaporwave the song.',
				type: 'STRING',
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

		if (message.args[0] && (message.args[0].toLowerCase() == 'reset' || message.args[0].toLowerCase() == 'off')) {
			player.resetFilter();
			const msg = await message.channel.send(message.translate('music/vaporwave:OFF_VW'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/vaporwave:DESC_2'));
			await bot.delay(5000);
			return msg.edit({ embeds: [embed] });
		} else {
			player.setFilter({
				equalizer: [
					{ band: 1, gain: 0.3 },
					{ band: 0, gain: 0.3 },
				],
				timescale: { pitch: 0.5 },
				tremolo: { depth: 0.3, frequency: 14 },
			});
			const msg = await message.channel.send(message.translate('music/vaporwave:ON_VW'));
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('music/vaporwave:DESC_1'));
			await bot.delay(5000);
			return msg.edit({ embeds: [embed] });
		}
	}

	// Function for slash command
	async callbacK(bot, interaction, guild, args) {
		const member = guild.members.cache.get(interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelID);
		const amount = args.get('amount').value;

		// Check if the member has role to interact with music plugin
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

		if (amount && (amount.toLowerCase() == 'reset' || amount.toLowerCase() == 'off')) {
			player.resetFilter();
			const msg = await interaction.reply(bot.translate('music/vaporwave:OFF_VW'));
			const embed = new Embed(bot, guild)
				.setDescription(bot.translate('music/vaporwave:DESC_2'));
			await bot.delay(5000);
			return interaction.editReply(embed);
		} else {
			player.setFilter({
				equalizer: [
					{ band: 1, gain: 0.3 },
					{ band: 0, gain: 0.3 },
				],
				timescale: { pitch: 0.5 },
				tremolo: { depth: 0.3, frequency: 14 },
			});
			const msg = await interaction.reply(bot.translate('music/vaporwave:ON_VW', { DB: amount }));
			const embed = new Embed(bot, guild)
				.setDescription(bot.translate('music/vaporwave:DESC_1'));
			await bot.delay(5000);
			return bot.editReply(embed);
		}
	}
};
