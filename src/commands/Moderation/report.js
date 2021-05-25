// Dependencies
const { Embed } = require('../../utils'),
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
	async run(bot, message, settings) {
		// Delete command for privacy
		if (message.deletable) message.delete();

		// Make sure that REPORT is in the mod logs
		if (settings.ModLogEvents.includes('REPORT')) {

			// Find user
			const members = await message.getMember();

			// Make sure user isn't trying to punish themselves
			if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH').then(m => m.delete({ timeout: 10000 }));

			// Make sure a reason was added
			if (!message.args[1]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/report:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

			// Send messages to ModLog channel
			const embed = new Embed(bot, message.guild)
				.setAuthor(message.translate('moderation/report:AUTHOR'), members[0].user.displayAvatarURL)
				.setColor(15158332)
				.addField(message.translate('moderation/report:MEMBER'), members[0], true)
				.addField(message.translate('moderation/report:BY'), message.member, true)
				.addField(message.translate('moderation/report:IN'), message.channel)
				.addField(message.translate('moderation/report:REASON'), message.args.slice(1).join(' '))
				.setTimestamp()
				.setFooter(message.guild.name);
			const repChannel = message.guild.channels.cache.find(channel => channel.id === settings.ModLogChannel);
			if (repChannel) {
				repChannel.send(embed);
				message.channel.success('moderation/report:SUCCESS', { USER: members[0].user }).then(m => m.delete({ timeout: 3000 }));
			}
		} else {
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'Logging: `REPORTS` has not been setup' }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
