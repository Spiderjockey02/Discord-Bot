// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Shuffle extends Command {
	constructor(bot) {
		super(bot, {
			name: 'shuffle',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Shuffles the playlist.',
			usage: 'shuffle',
			cooldown: 3000,
			slash: true,
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// check to make sure bot can play music based on permissions
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		const player = bot.manager.players.get(message.guild.id);

		// shuffle queue
		player.queue.shuffle();
		const embed = new MessageEmbed()
			.setColor(message.member.displayHexColor)
			.setDescription(message.translate('music/shuffle:DESC'));
		message.channel.send({ embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		// Check if the member has role to interact with music plugin
		const member = guild.members.cache.get(interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelID);

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return bot.send(interaction, { embeds: [channel.error(playable, {}, true)], ephemeral: true });

		const player = bot.manager.players.get(member.guild.id);

		// shuffle queue
		player.queue.shuffle();
		const embed = new Embed(bot, guild)
			.setColor(member.displayHexColor)
			.setDescription(bot.translate('music/shuffle:DESC'));
		bot.send(interaction, { embeds: [embed] });
	}
};
