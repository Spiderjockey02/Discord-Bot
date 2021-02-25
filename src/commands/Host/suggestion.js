// Dependecies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Suggestion extends Command {
	constructor(bot) {
		super(bot, {
			name: 'suggestion',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Add a suggestion to bot',
			usage: 'suggestion <title> - <description> - <plugin>',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Make sure a support server has been entered
		if (bot.config.SupportServer) {
			const channel = bot.channels.cache.get(bot.config.SupportServer.SuggestionChannel);
			if (!channel) return message.channel.send('Please properly set up your config.');
			const words = args.join(' ').split('-');
			if (words.length != 3) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
			// send message
			const title = words[0],
				description = words[1],
				plugin = words[2];

			const embed = new MessageEmbed()
				.setTitle(title)
				.setDescription(description)
				.addField('Category', plugin)
				.setTimestamp()
				.setFooter(`${bot.user.username} suggestions`, bot.user.displayAvatarURL());

			channel.send(embed).then(async (msg) => {
				await msg.react('👍');
				await msg.react('👎');
			});
		} else {
			message.channel.send('Please fill out your config SupportServer information.');
		}
	}
};
