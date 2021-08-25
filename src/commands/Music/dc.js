// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Disconnect command
 * @extends {Command}
*/
class Disconnect extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'dc',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['stop', 'disconnect'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Disconnects the bot from the voice channel.',
			usage: 'dc',
			cooldown: 3000,
			slash: true,
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message) {
		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		// Destory player (clears queue & leaves channel)
		const player = bot.manager?.players.get(message.guild.id);
		player.destroy();
		return message.channel.success('music/dc:LEFT');
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// Destory player (clears queue & leaves channel)
		const player = bot.manager?.players.get(member.guild.id);
		player.destroy();
		return interaction.reply({ embeds: [channel.success('music/dc:LEFT', { ARGS: null }, true)] });
	}
}

module.exports = Disconnect;
