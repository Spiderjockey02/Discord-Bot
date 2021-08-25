// Dependencies
const { shorten } = require('tinyurl'),
	Command = require('../../structures/Command.js');

/**
 * ShortURL command
 * @extends {Command}
*/
class ShortURL extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'shorturl',
			dirname: __dirname,
			aliases: ['surl', 'short-url'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Creates a shorturl on the URL you sent.',
			usage: 'shorturl',
			cooldown: 3000,
			examples: ['shorturl https://www.google.com', 'shorturl https://www.youtube.com'],
			slash: true,
			options: [{
				name: 'url',
				description: 'The specified URL to shorten.',
				type: 'STRING',
				required: true,
			}],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		const mes = message.content.split(' ').slice(1).join(' ');

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }), { tts: true });

		try {
			shorten(mes, function(res) {
				msg.delete();
				message.channel.send(res);
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId);
		const link = args.get('url').value;

		try {
			await shorten(link, async function(res) {
				return interaction.reply({ content: res });
			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = ShortURL;
