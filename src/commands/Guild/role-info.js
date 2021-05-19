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
		const embed = new Embed(message)
			.setColor(role[0].color)
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(message.translate('guild/role-info:NAME', { NAME: role[0].name }))
			.addField(message.translate('guild/role-info:MEMBERS'), role[0].members.size, true)
			.addField(message.translate('guild/role-info:COLOR'), role[0].hexColor, true)
			.addField(message.translate('guild/role-info:POSITION'), role[0].position, true)
			.addField(message.translate('guild/role-info:MENTION'), `<@&${role[0].id}>`, true)
			.addField(message.translate('guild/role-info:HOISTED'), role[0].hoist, true)
			.addField(message.translate('guild/role-info:MENTIONABLE'), role[0].mentionable, true)
			.addField(message.translate('guild/role-info:PERMISSION'), permissions)
			.addField(message.translate('guild/role-info:CREATED'), moment(role[0].createdAt).format('lll'))
			.setTimestamp()
			.setFooter('guild/role-info:FOOTER', { MEMBER: message.author.tag, ID: role[0].id });
		message.channel.send(embed);
	}
};
