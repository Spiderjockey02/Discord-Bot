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
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Check to see if a role was mentioned
		const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);

		// Make sure it's a role on the server
		if (!role) {
			if (message.deletable) message.delete();
			message.error(settings.Language, 'MISSING_ROLE').then(m => m.delete({ timeout: 10000 }));
			return;
		}

		// Send information to channel
		const embed = new MessageEmbed()
			.setColor(role.color)
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(message.translate(settings.Language, 'GUILD/ROLE_NAME', role.name))
			.addField(message.translate(settings.Language, 'GUILD/ROLE_MEMBERS'), role.members.size, true)
			.addField(message.translate(settings.Language, 'GUILD/ROLE_COLOR'), role.hexColor, true)
			.addField(message.translate(settings.Language, 'GUILD/ROLE_POSITION'), role.position, true)
			.addField(message.translate(settings.Language, 'GUILD/ROLE_MENTION'), `<@&${role.id}>`, true)
			.addField(message.translate(settings.Language, 'GUILD/ROLE_HOISTED'), role.hoist, true)
			.addField(message.translate(settings.Language, 'GUILD/ROLE_MENTIONABLE'), role.mentionable, true)
			.addField(message.translate(settings.Language, 'GUILD/ROLE_PERMISSION'), role.permissions.toArray().toString().toLowerCase().replace(/_/g, ' ').replace(/,/g, ' » '))
			.addField(message.translate(settings.Language, 'GUILD/ROLE_CREATED'), moment(role.createdAt).format('lll'))
			.setTimestamp()
			.setFooter(message.translate(settings.Language, 'GUILD/ROLE_FOOTER', [`${message.author.tag}`, `${role.id}`]));
		message.channel.send(embed);
	}
};
