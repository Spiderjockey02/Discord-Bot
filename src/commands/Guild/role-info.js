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
		const role = message.getRole();

		// Make sure it's a role on the server
		if (!role[0]) {
			if (message.deletable) message.delete();
			return message.channel.error(settings.Language, 'MISSING_ROLE').then(m => m.delete({ timeout: 10000 }));
		}

		// translate permissions
		const permissions = role[0].permissions.toArray().map((p) => message.translate(`permissions:${p}`)).join(' » ');

		// Send information to channel
		const embed = new Embed(bot, message.guild)
			.setColor(role[0].color)
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(message.translate('guild/role-info:NAME', { NAME: role[0].name }))
			.addFields(
				{ name: message.translate('guild/role-info:MEMBERS'), value: role[0].members.size, inline: true },
				{ name: message.translate('guild/role-info:COLOR'), value: role[0].hexColor, inline: true },
				{ name: message.translate('guild/role-info:POSITION'), value: role[0].position, inline: true },
				{ name: message.translate('guild/role-info:MENTION'), value: `<@&${role[0].id}>`, inline: true },
				{ name: message.translate('guild/role-info:HOISTED'), value: role[0].hoist, inline: true },
				{ name: message.translate('guild/role-info:MENTIONABLE'), value: role[0].mentionable, inline: true },
				{ name: message.translate('guild/role-info:PERMISSION'), value: permissions },
				{ name: message.translate('guild/role-info:CREATED'), value: moment(role[0].createdAt).format('lll') },
			)
			.setTimestamp()
			.setFooter('guild/role-info:FOOTER', { MEMBER: message.author.tag, ID: role[0].id });
		message.channel.send(embed);
	}
};
