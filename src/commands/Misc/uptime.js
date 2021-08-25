// Dependencies
const { Embed } = require('../../utils'),
	{ time: { getReadableTime } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Uptime command
 * @extends {Command}
*/
class Uptime extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'uptime',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Gets the uptime of the bot.',
			usage: 'uptime',
			cooldown: 2000,
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
		const embed = new Embed(bot, message.guild)
			.setDescription(message.translate('misc/uptime:DESC', { TIME: getReadableTime(bot.uptime) }));
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const embed = new Embed(bot, guild)
			.setDescription(guild.translate('misc/uptime:DESC', { TIME: getReadableTime(bot.uptime) }));
		return interaction.reply({ embeds: [embed] });
	}
}

module.exports = Uptime;
