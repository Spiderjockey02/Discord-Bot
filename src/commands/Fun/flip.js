// Dependencies
const	Command = require('../../structures/Command.js');

/**
 * Flip command
 * @extends {Command}
*/
class Flip extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'flip',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Flip a coin.',
			usage: 'flip',
			cooldown: 1000,
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
		const num = Math.round(Math.random()),
			emoji = message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis[['head', 'tail'][num]] : '',
			result = message.translate(`fun/flip:${num < 0.5 ? 'HEADS' : 'TAILS'}`);

		// send result
		message.channel.send(`${emoji} ${result}`);
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelId),
			num = Math.round(Math.random()),
			emoji = channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis[['head', 'tail'][num]] : '',
			result = guild.translate(`fun/flip:${num < 0.5 ? 'HEADS' : 'TAILS'}`);

		// send result
		return interaction.reply({ content: `${emoji} ${result}` });
	}
}

module.exports = Flip;
