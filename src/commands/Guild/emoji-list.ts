// Dependencies
const	Command = require('../../structures/Command.js');

/**
 * Emoji-list command
 * @extends {Command}
*/
class EmojiList extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'emoji-list',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['emojilist', 'emotes'],
			description: 'Displays the server\'s emojis',
			usage: 'emojilist',
			cooldown: 2000,
			slash: true,
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		const emojiList = message.translate('guild/emoji-list:MESSAGE', { GUILD: message.guild.name, EMOJIS: message.guild.emojis.cache.map(e => e.toString()).join(' ') });
		message.channel.send({ content:  emojiList });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const emojiList = guild.translate('guild/emoji-list:MESSAGE', { GUILD: guild.name, EMOJIS: guild.emojis.cache.map(e => e.toString()).join(' ') });
		interaction.reply({ content: emojiList });
	}
}

module.exports = EmojiList;
