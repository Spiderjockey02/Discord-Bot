// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Autoplay command
 * @extends {Command}
*/
class Autoplay extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'autoplay',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['auto-play'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Toggles autoplay mode.',
			usage: 'autoplay',
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

		// toggle autoplay mode off and on
		const player = bot.manager?.players.get(message.guild.id);
		player.autoplay = !player.autoplay;
		message.channel.send(message.translate('music/AUTOPLAY:RESP', { TOGGLE: player.autoplay }));
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

		// toggle autplay mode off and on
		const player = bot.manager?.players.get(member.guild.id);
		player.autoplay = !player.autoplay;
		await interaction.reply({ content: bot.translate('music/247:RESP', { TOGGLE: player.autoplay }) });
	}
}

module.exports = Autoplay;
