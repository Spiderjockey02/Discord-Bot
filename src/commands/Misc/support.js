// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Support command
 * @extends {Command}
*/
class Support extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'support',
			dirname: __dirname,
			aliases: ['sup'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get support on the bot.',
			usage: 'support',
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
			.setTitle('misc/support:TITLE', { USER: bot.user.username })
			.setDescription(bot.translate('misc/support:DESC', 	{ SUPPORT: bot.config.SupportServer.link, WEBSITE: bot.config.websiteURL }));
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
			.setTitle('misc/support:TITLE', { USER: bot.user.username })
			.setDescription(guild.translate('misc/support:DESC', 	{ SUPPORT: bot.config.SupportServer.link, WEBSITE: bot.config.websiteURL }));
		return interaction.reply({ embeds: [embed] });
	}
}

module.exports = Support;
