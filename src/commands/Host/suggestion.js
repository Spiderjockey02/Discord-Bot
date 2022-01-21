// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Docs command
 * @extends {Command}
*/
class Suggestion extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'suggestion',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
			description: 'Add a suggestion to bot',
			usage: 'suggestion <title> - <description> - <plugin>',
			cooldown: 3000,
			examples: ['suggestion Level reset - Should member levels reset when they leave the server - Economy plugin'],
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
		// Make sure a support server has been entered
		if (bot.config.SupportServer) {
			// get suggestion channel
			const channel = bot.channels.cache.get(bot.config.SupportServer.SuggestionChannel);
			if (!channel) return message.channel.send('Please properly set up your config.');

			const words = message.args.join(' ').split('-');
			if (words.length != 3) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/suggestion:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

			// send message
			const title = words[0],
				description = words[1],
				plugin = words[2];

			const embed = new Embed(bot, message.guild)
				.setTitle(title)
				.setDescription(description)
				.addField('Category', plugin)
				.setTimestamp()
				.setFooter({ text: `${bot.user.username} suggestions`, iconURL: bot.user.displayAvatarURL() });

			channel.send({ embeds: [embed] }).then(async (msg) => {
				await msg.react('👍');
				await msg.react('👎');
			});
		} else {
			message.channel.send('Please fill out your config SupportServer information.');
		}
	}
}

module.exports = Suggestion;
