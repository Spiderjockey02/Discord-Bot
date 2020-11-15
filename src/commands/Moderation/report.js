// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Make sure that REPORT is in the mod logs
	if (settings.ModLogEvents.includes('REPORT')) {
		if (message.deletable) message.delete();
		// Find user
		const member = bot.getUsers(message, args);

		// Make sure a reason was added
		if (!args[1]) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('report').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

		// Send messages to ModLog channel
		const embed = new MessageEmbed()
			.setAuthor(message.translate(settings.Language, 'MODERATION/REPORT_AUTHOR'), member[0].user.displayAvatarURL)
			.addField(message.translate(settings.Language, 'MODERATION/REPORT_MEMBER'), member[0], true)
			.addField(message.translate(settings.Language, 'MODERATION/REPORT_BY'), message.member, true)
			.addField(message.translate(settings.Language, 'MODERATION/REPORT_IN'), message.channel)
			.addField(message.translate(settings.Language, 'MODERATION/REPORT_REASON'), args.slice(1).join(' '))
			.setTimestamp()
			.setFooter(message.guild.name);
		const repChannel = message.guild.channels.cache.find(channel => channel.id === settings.ModLogChannel);
		if (repChannel) {
			repChannel.send(embed);
			message.success(settings.Language, 'MODERATION/SUCCESSFULL_REPORT', member[0].user).then(m => m.delete({ timeout: 3000 }));
		}
	}
};

module.exports.config = {
	command: 'report',
	aliases: ['rep'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Report',
	category: 'Moderation',
	description: 'Report a user.',
	usage: '${PREFIX}report <user> [reason]',
	example: '${PREFIX}report @MeanPerson was being mean to me',
};
