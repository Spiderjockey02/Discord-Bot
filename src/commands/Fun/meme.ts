// Dependencies
const	Command = require('../../structures/Command.js');

/**
 * Meme command
 * @extends {Command}
*/
class Meme extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'meme',
			dirname: __dirname,
			description: 'Sends a random meme.',
			usage: 'meme',
			cooldown: 1000,
			slash: true,
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Retrieve a random meme
		const embed = await this.fetchMeme(bot, message.channel, settings);

		// Send the meme to channel
		msg.delete();
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const settings = guild.settings;
		const embed = await this.fetchMeme(bot, interaction.channel, settings);
		return interaction.reply({ embeds: [embed] });
	}

	/**
 	 * Function for fetching meme embed.
 	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command ran in
 	 * @param {settings} guildSettings The settings of the guild
 	 * @returns {embed}
	*/
	async fetchMeme(bot, channel) {
		const subreddits = ['meme', 'memes', 'dankmemes', 'ComedyCemetery'];

		return await bot.commands.get('reddit').fetchPost(bot, channel, subreddits[Math.floor(Math.random() * subreddits.length)], 'hot');
	}
}

module.exports = Meme;
