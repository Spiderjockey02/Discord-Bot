// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Poll command
 * @extends {Command}
*/
class Poll extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name:  'poll',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
			description: 'Create a poll for users to answer.',
			usage: 'poll <question>',
			cooldown: 2000,
			examples: ['poll Is this a good bot?'],
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Make sure a poll was provided
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('guild/poll:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Send poll to channel
		const embed = new Embed(bot, message.guild)
			.setTitle('guild/poll:TITLE', { USER: message.author.tag })
			.setDescription(message.args.join(' '))
			.setFooter({ text: message.guild.translate('guild/poll:FOOTER') });
		message.channel.send({ embeds: [embed] }).then(async (msg) => {
			// Add reactions to message
			await msg.react('✅');
			await msg.react('❌');
		});
	}
}

module.exports = Poll;
