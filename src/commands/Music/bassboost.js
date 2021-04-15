// Dependecies
const { MessageEmbed } = require('discord.js'),
	delay = ms => new Promise(res => setTimeout(res, ms)),
	Command = require('../../structures/Command.js');

module.exports = class Bassboost extends Command {
	constructor(bot) {
		super(bot, {
			name: 'bassboost',
			dirname: __dirname,
			aliases: ['bb'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Bassboost the song',
			usage: 'bassboost [value]',
			cooldown: 3000,
			examples: ['bb 8', 'bb -4'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error(settings.Language, 'MUSIC/MISSING_DJROLE').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.channel.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

		// Check that user is in the same voice channel
		if (message.member.voice.channel.id !== player.voiceChannel) return message.channel.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

		// Default to turning on bassboost
		if (!message.args[0]) {
			player.setFilter({
				equalizer: [
					...Array(6).fill(0).map((n, i) => ({ band: i, gain: 0.65 })),
					...Array(9).fill(0).map((n, i) => ({ band: i + 6, gain: 0 })),
				],
			});
			const msg = await message.channel.send('Turning on **bassboost**. This may take a few seconds...');
			const embed = new MessageEmbed()
				.setDescription('Turned on **bassboost**');
			await delay(5000);
			return msg.edit('', embed);
		}

		// Turn off bassboost
		if (message.args[0].toLowerCase() == 'reset' || message.args[0].toLowerCase() == 'off') {
			player.resetFilter();
			const msg = await message.channel.send('Turning off **bassboost**. This may take a few seconds...');
			const embed = new MessageEmbed()
				.setDescription('Turned off **bassboost**');
			await delay(5000);
			return msg.edit('', embed);
		}

		// Make sure value is a number
		if (isNaN(message.args[0])) return message.channel.send('Amount must be a real number.');

		// Turn on bassboost with custom value
		player.setFilter({
			equalizer: [
				...Array(6).fill(0).map((n, i) => ({ band: i, gain: message.args[0] / 10 })),
				...Array(9).fill(0).map((n, i) => ({ band: i + 6, gain: 0 })),
			],
		});
		const msg = await message.channel.send(` Setting bassboost to **${message.args[0]}dB**. This may take a few seconds...`);
		const embed = new MessageEmbed()
			.setDescription(`Bassboost set to: **${message.args[0]}**`);
		await delay(5000);
		return msg.edit('', embed);
	}
};
