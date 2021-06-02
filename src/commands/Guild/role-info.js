// Dependencies
const { Embed } = require('../../utils'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');

module.exports = class RoleInfo extends Command {
	constructor(bot) {
		super(bot, {
			name:  'role-info',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['roleinfo'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on a role.',
			usage: 'role-info <role>',
			cooldown: 2000,
			examples: ['role-info roleID', 'role-info @mention', 'role-info name'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check to see if a role was mentioned
		const roles = message.getRole();

		// Make sure it's a role on the server
		if (!roles[0]) {
			if (message.deletable) message.delete();
			// Make sure a poll was provided
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('guild/role-info:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		}

		// translate permissions
		const permissions = roles[0].permissions.toArray().map((p) => message.translate(`permissions:${p}`)).join(' » ');

		// Send information to channel
		const embed = new Embed(bot, message.guild)
			.setColor(roles[0].color)
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(message.translate('guild/role-info:NAME', { NAME: roles[0].name }))
			.addFields(
				{ name: message.translate('guild/role-info:MEMBERS'), value: roles[0].members.size.toLocaleString(settings.Language), inline: true },
				{ name: message.translate('guild/role-info:COLOR'), value: roles[0].hexColor, inline: true },
				{ name: message.translate('guild/role-info:POSITION'), value: roles[0].position, inline: true },
				{ name: message.translate('guild/role-info:MENTION'), value: `<@&${roles[0].id}>`, inline: true },
				{ name: message.translate('guild/role-info:HOISTED'), value: roles[0].hoist, inline: true },
				{ name: message.translate('guild/role-info:MENTIONABLE'), value: roles[0].mentionable, inline: true },
				{ name: message.translate('guild/role-info:PERMISSION'), value: permissions },
				{ name: message.translate('guild/role-info:CREATED'), value: moment(roles[0].createdAt).format('lll') },
			)
			.setTimestamp()
			.setFooter('guild/role-info:FOOTER', { MEMBER: message.author.tag, ID: roles[0].id });
		message.channel.send(embed);
	}
};
