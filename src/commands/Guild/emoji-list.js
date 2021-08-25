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
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays the server\'s emojis',
			usage: 'emojilist',
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
		message.channel.send(message.translate('guild/emoji-list:MESSAGE', { GUILD: message.guild.name, EMOJIS: message.guild.emojis.cache.map(e => e.toString()).join(' ') }));
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		interaction.reply({ content: guild.translate('guild/emoji-list:MESSAGE', { GUILD: guild.name, EMOJIS: guild.emojis.cache.map(e => e.toString()).join(' ') }) });
	}
}

module.exports = EmojiList;
