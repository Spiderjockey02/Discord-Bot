// Dependencies
const { MessageEmbed } = require('discord.js'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');

module.exports = class RoleInfo extends Command {
	constructor(bot) {
		super(bot, {
			name:  'roleinfo',
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

		// Send information to channel
		const embed = new MessageEmbed()
			.setColor(role[0].color)
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(bot.translate(settings.Language, 'GUILD/ROLE_NAME', role[0].name))
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_MEMBERS'), role[0].members.size, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_COLOR'), role[0].hexColor, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_POSITION'), role[0].position, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_MENTION'), `<@&${role[0].id}>`, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_HOISTED'), role[0].hoist, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_MENTIONABLE'), role[0].mentionable, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_PERMISSION'), role[0].permissions.toArray().toString().toLowerCase().replace(/_/g, ' ').replace(/,/g, ' » '))
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_CREATED'), moment(role[0].createdAt).format('lll'))
			.setTimestamp()
			.setFooter(bot.translate(settings.Language, 'GUILD/ROLE_FOOTER', [`${message.author.tag}`, `${role[0].id}`]));
		message.channel.send(embed);
	}
};
