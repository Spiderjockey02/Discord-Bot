// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Disconnect extends Command {
	constructor(bot) {
		super(bot, {
			name: 'dc',
			dirname: __dirname,
			aliases: ['stop', 'disconnect'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Disconnects the bot from the voice channel.',
			usage: 'dc',
			cooldown: 3000,
			slash: true,
		});
	}

	// Function for message command
	async run(bot, message) {
		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		// Destory player (clears queue & leaves channel)
		const player = bot.manager.players.get(message.guild.id);
		player.destroy();
		return message.channel.success('music/dc:LEFT');
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// Destory player (clears queue & leaves channel)
		const player = bot.manager.players.get(member.guild.id);
		player.destroy();
		return interaction.reply({ embeds: [channel.success('music/dc:LEFT', { ARGS: null }, true)] });
	}
};
