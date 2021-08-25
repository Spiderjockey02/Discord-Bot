// Dependencies
const	Command = require('../../structures/Command.js');

/**
 * Dashboard command
 * @extends {Command}
*/
class Dashboard extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'dashboard',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['db'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Sends a link to your Server\'s dashboard.',
			usage: 'dashboard',
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
		message.channel.send(`${bot.config.websiteURL}/dashboard/${message.guild.id}`);
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		interaction.reply({ content: `${bot.config.websiteURL}/dashboard/${guild.id}` });
	}
}

module.exports = Dashboard;
