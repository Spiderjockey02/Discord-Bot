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
	async run(bot, message, args, settings) {
		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

		// Check that user is in the same voice channel
		if (message.member.voice.channel.id !== player.voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

		if (args[0] && (args[0].toLowerCase() == 'reset' || args[0].toLowerCase() == 'off')) {
			player.resetFilter();
			const msg = await message.channel.send('Reseting **pitch**. This may take a few seconds...');
			const embed = new MessageEmbed()
				.setDescription('Reset **pitch**');
			await delay(5000);
			return msg.edit('', embed);
		}

		if (isNaN(args[0])) return message.channel.send('Amount must be a real number.');
		if (args[0] < 0) return message.channel.send('Pitch must be greater than 0.');
		if (args[0] > 10) return message.channel.send('Pitch must be less than 10.');

		player.setFilter({
			timescale: { pitch: args[0] },
		});
		const msg = await message.channel.send(`Setting pitch to **${args[0]}**. This may take a few seconds...`);
		const embed = new MessageEmbed()
			.setDescription(`Pitch set to: **${args[0]}**`);
		await delay(5000);
		return msg.edit('', embed);
	}
};
