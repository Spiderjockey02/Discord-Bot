// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Report extends Command {
	constructor(bot) {
		super(bot, {
			name: 'report',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['rep'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Report a user.',
			usage: 'report <user> [reason]',
			cooldown: 3000,
			examples: ['report username', 'report username swearing'],
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Delete command for privacy
		if (message.deletable) message.delete();

		// Make sure that REPORT is in the mod logs
		if (settings.ModLogEvents.includes('REPORT')) {

			// Find user
			const member = message.guild.getMember(message, args);
			if (member[0].user.id == message.author.id) return message.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

			// Make sure a reason was added
			if (!args[1]) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

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
		} else {
			message.error(settings.Language, 'ERROR_MESSAGE', 'Logging: `REPORTS` has not been setup').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
