// Dependencies
const { MessageEmbed } = require('discord.js'),
	moment = require('moment'),
	sm = require('string-similarity'),
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
		let role = message.mentions.roles.first() || message.guild.roles.cache.get(message.args[0]);

		// Make sure it's a role on the server
		if (!role) {
			if (message.args[0]) {
				const roles = [];
				const indexes = [];
				message.guild.roles.cache.forEach(r => {
					roles.push(r.name);
					indexes.push(r.id);
				});
				const match = sm.findBestMatch(message.args.join(' '), roles);
				const username = match.bestMatch.target;
				role = message.guild.roles.cache.get(indexes[roles.indexOf(username)]);
			} else {
				if (message.deletable) message.delete();
				message.channel.error(settings.Language, 'MISSING_ROLE').then(m => m.delete({ timeout: 10000 }));
				return;
			}
		}

		// Send information to channel
		const embed = new MessageEmbed()
			.setColor(role.color)
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(bot.translate(settings.Language, 'GUILD/ROLE_NAME', role.name))
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_MEMBERS'), role.members.size, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_COLOR'), role.hexColor, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_POSITION'), role.position, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_MENTION'), `<@&${role.id}>`, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_HOISTED'), role.hoist, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_MENTIONABLE'), role.mentionable, true)
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_PERMISSION'), role.permissions.toArray().toString().toLowerCase().replace(/_/g, ' ').replace(/,/g, ' » '))
			.addField(bot.translate(settings.Language, 'GUILD/ROLE_CREATED'), moment(role.createdAt).format('lll'))
			.setTimestamp()
			.setFooter(bot.translate(settings.Language, 'GUILD/ROLE_FOOTER', [`${message.author.tag}`, `${role.id}`]));
		message.channel.send(embed);
	}
};
