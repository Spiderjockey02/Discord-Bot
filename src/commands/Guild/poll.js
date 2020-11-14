// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Check bot for add reaction permission
	if (!message.guild.me.hasPermission('ADD_REACTIONS')) {
		bot.logger.error(`Missing permission: \`ADD_REACTIONS\` in [${message.guild.id}]`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'ADD_REACTIONS').then(m => m.delete({ timeout: 10000 }));
	}

	// Make sure a poll was provided
	if (!args[0]) {
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('poll').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	// Send poll to channel
	const embed = new MessageEmbed()
		.setColor(0xffffff)
		.setTitle(message.translate(settings.Language, 'GUILD/POLL_TITLE', message.author.username))
		.setDescription(args.join(' '))
		.setFooter(message.translate(settings.Language, 'GUILD/POLL_FOOTER'))
		.setTimestamp();
	const msg = await message.channel.send(embed);
	// Add reactions to message
	await msg.react('✅');
	await msg.react('❌');
};

module.exports.config = {
	command: 'poll',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
};

module.exports.help = {
	name: 'Poll',
	category: 'Guild',
	description: 'Create a poll for users to answer.',
	usage: '${PREFIX}poll <question>',
	example: '${PREFIX}poll is Egglord the best?',
};
