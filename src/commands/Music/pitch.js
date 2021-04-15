// Dependecies
const { MessageEmbed } = require('discord.js'),
	delay = ms => new Promise(res => setTimeout(res, ms)),
	Command = require('../../structures/Command.js');

module.exports = class Pitch extends Command {
	constructor(bot) {
		super(bot, {
			name: 'pitch',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Sets the player\'s pitch. If you input "reset", it will set the pitch back to default.',
			usage: 'pitch',
			cooldown: 3000,
			examples: ['pitch off', 'pitch 6'],
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

		if (message.args[0] && (message.args[0].toLowerCase() == 'reset' || message.args[0].toLowerCase() == 'off')) {
			player.resetFilter();
			const msg = await message.channel.send('Reseting **pitch**. This may take a few seconds...');
			const embed = new MessageEmbed()
				.setDescription('Reset **pitch**');
			await delay(5000);
			return msg.edit('', embed);
		}

		if (isNaN(message.args[0])) return message.channel.send('Amount must be a real number.');
		if (message.args[0] < 0 || message.args[0] > 10) return message.channel.send('Pitch must be inbetween 0 and 10.');

		player.setFilter({
			timescale: { pitch: message.args[0] },
		});
		const msg = await message.channel.send(`Setting pitch to **${message.args[0]}**. This may take a few seconds...`);
		const embed = new MessageEmbed()
			.setDescription(`Pitch set to: **${message.args[0]}**`);
		await delay(5000);
		return msg.edit('', embed);
	}
};
