// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ functions: { checkMusic } } = require('../../utils'),
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
		});
	}

	// Function for message command
	async run(bot, message) {
		// check to make sure bot can play music based on permissions
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		// toggle vaporwave mode on/off
		const player = bot.manager.players.get(message.guild.id);
		player.setVaporwave(!player.vaporwave);
		const msg = await message.channel.send(message.translate(`music/vaporwave:${player.vaporwave ? 'ON' : 'OFF'}_VW`));
		const embed = new MessageEmbed()
			.setDescription(message.translate(`music/vaporwave:DESC_${player.vaporwave ? '1' : '2'}`));
		await bot.delay(5000);
		return msg.edit({ content: '​​ ', embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return bot.send(interaction, { embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// toggle vaporwave mode on/off
		const player = bot.manager.players.get(member.guild.id);
		player.setVaporwave(!player.vaporwave);
		await bot.send(interaction, { content: guild.translate(`music/vaporwave:${player.vaporwave ? 'ON' : 'OFF'}_VW`) });
		const embed = new MessageEmbed(bot, guild)
			.setDescription(guild.translate(`music/vaporwave:DESC_${player.vaporwave ? '1' : '2'}`));
		await bot.delay(5000);
		return interaction.editReply({ content: '​​ ', embeds: [embed] });
	}
};
