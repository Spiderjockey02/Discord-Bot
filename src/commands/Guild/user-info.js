// Dependencies
const { Embed } = require('../../utils'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');

module.exports = class UserInfo extends Command {
	constructor(bot) {
		super(bot, {
			name:  'user-info',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['userinfo', 'whois'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on the server.',
			usage: 'user-info [user]',
			cooldown: 2000,
			examples: ['user-info userID', 'user-info @mention', 'user-info username'],
		});
	}

	// Run command
	async run(bot, message) {
		// Get user
		const members = await message.getMember();

		// send user info
		const embed = new Embed(bot, message.guild)
			.setAuthor(members[0].user.tag, members[0].user.displayAvatarURL())
			.setColor(3447003)
			.setThumbnail(members[0].user.displayAvatarURL({ format: 'png', size: 512 }))
			.addFields(
				{ name: message.translate('guild/user-info:USERNAME'), value: members[0].user.username, inline: true },
				{ name: message.translate('guild/user-info:DISCRIM'), value: members[0].user.discriminator, inline: true },
				{ name: message.translate('guild/user-info:ROBOT'), value: message.translate(`misc:${members[0].user.bot ? 'YES' : 'NO'}`), inline: true },
				{ name: message.translate('guild/user-info:CREATE'), value: moment(members[0].user.createdAt).format('lll'), inline: true },
				{ name: message.translate('guild/user-info:STATUS'), value: `\`${(members[0].presence.activities.length >= 1) ? `${members[0].presence.activities[0].name} - ${(members[0].presence.activities[0].type == 'CUSTOM_STATUS') ? members[0].presence.activities[0].state : members[0].presence.activities[0].details}` : 'None'}\``, inline: true },
				{ name: message.translate('guild/user-info:ROLE'), value: members[0].roles.highest, inline: true },
				{ name: message.translate('guild/user-info:JOIN'), value: moment(members[0].joinedAt).format('lll'), inline: true },
				{ name: message.translate('guild/user-info:NICK'), value: members[0].nickname != null ? members[0].nickname : message.translate('misc:NONE'), inline: true },
				{ name: message.translate('guild/user-info:ROLES'), value: members[0].roles.cache.map(roles => roles).join(', ') },
			);
		message.channel.send(embed);
	}
};
