// Dependencies
const { MessageEmbed } = require('discord.js'),
	delay = ms => new Promise(res => setTimeout(res, ms)),
	Command = require('../../structures/Command.js');

module.exports = class Vaporwave extends Command {
	constructor(bot) {
		super(bot, {
			name: 'vaporwave',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Toggles vaporwave mode.',
			usage: 'vaporwave',
			cooldown: 3000,
			examples: ['vaporwave off'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error(settings.Language, 'MUSIC/MISSING_DJROLE').then(m => setTimeout(() => { m.delete(); }, 10000));
			}
		}

		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.channel.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => setTimeout(() => { m.delete(); }, 5000));

		// Check that user is in the same voice channel
		if (message.member.voice.channel.id !== player.voiceChannel) return message.channel.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => setTimeout(() => { m.delete(); }, 5000));

		if (message.args[0] && (message.args[0].toLowerCase() == 'reset' || message.args[0].toLowerCase() == 'off')) {
			player.resetFilter();
			const msg = await message.channel.send('Turning off **Vaporwave**. This may take a few seconds...');
			const embed = new MessageEmbed()
				.setDescription('Turned off **Vaporwave**');
			await delay(5000);
			return msg.edit('', embed);
		} else {
			player.setFilter({
				equalizer: [
					{ band: 1, gain: 0.3 },
					{ band: 0, gain: 0.3 },
				],
				timescale: { pitch: 0.5 },
				tremolo: { depth: 0.3, frequency: 14 },
			});
			const msg = await message.channel.send('Enabling **Vaporwave**. This may take a few seconds...');
			const embed = new MessageEmbed()
				.setDescription('Turned on **Vaporwave**');
			await delay(5000);
			return msg.edit('', embed);
		}
	}
};
