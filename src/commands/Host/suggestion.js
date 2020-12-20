// Dependecies
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Make sure only bot owner can do this command
	if (!bot.config.ownerID.includes(message.author.id)) return;

	// Make sure a support server has been entered
	if (bot.config.SupportServer) {
		const channel = bot.channels.cache.get(bot.config.SupportServer.SuggestionChannel);
		if (!channel) return message.channel.send('Please properly set up your config.');
		const words = args.join(' ').split('-');
		if (words.length != 3) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('suggestion').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
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
};

module.exports.config = {
	command: 'suggestion',
};

module.exports.help = {
	name: 'Suggestion',
	category: 'Host',
	description: 'Add a suggestion to bot',
	usage: '${PREFIX}suggestion <title> - <description> - <plugin>',
};
