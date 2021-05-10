// Dependencies
const { MessageEmbed } = require('discord.js'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');

module.exports = class ServerInfo extends Command {
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
	async run(bot, message, settings) {
		// Get user
		const member = message.getMember();

		// send user info
		const embed = new MessageEmbed()
			.setAuthor(`${member[0].user.tag}`, member[0].user.displayAvatarURL())
			.setColor(3447003)
			.setThumbnail(member[0].user.displayAvatarURL({ format: 'png', size: 512 }))
			.addFields(
				{ name: '✍ Username', value: member[0].user.username, inline: true },
				{ name: '#️⃣ Discriminator', value: member[0].user.discriminator, inline: true },
				{ name: '🤖 Robot', value: member[0].user.bot ? 'Yes' : 'No', inline: true },
				{ name: 'Creation', value: moment(member[0].user.createdAt).format('lll'), inline: true },
				{ name: '📶 Status', value: `\`${(member[0].presence.activities.length >= 1) ? `${member[0].presence.activities[0].name} - ${(member[0].presence.activities[0].type == 'CUSTOM_STATUS') ? member[0].presence.activities[0].state : member[0].presence.activities[0].details}` : 'None'}\``, inline: true },
				{ name: '🔼 Highest role', value: member[0].roles.highest, inline: true },
				{ name: 'Join', value: moment(member[0].joinedAt).format('lll'), inline: true },
				{ name: '📝 Nickname', value: member[0].nickname != null ? member[0].nickname : 'None', inline: true },
				{ name: 'Roles', value: member[0].roles.cache.map(roles => roles).join(', ') },
			);
			// .addField(bot.translate(settings.Language, 'GUILD/USER_NICKNAME'), `\`${member[0].nickname != null ? member[0].nickname : 'None'}\``, true)
			// .addField(bot.translate(settings.Language, 'GUILD/USER_GAME'), `\`${(member[0].presence.activities.length >= 1) ? `${member[0].presence.activities[0].name} - ${(member[0].presence.activities[0].type == 'CUSTOM_STATUS') ? member[0].presence.activities[0].state : member[0].presence.activities[0].details}` : 'None'}\``, true)
			// .addField(bot.translate(settings.Language, 'GUILD/USER_ROLES', [member[0].roles.cache.size, message.guild.roles.cache.size]), member[0].roles.cache.map(roles => roles).join(', '), true)
			// .addField(bot.translate(settings.Language, 'GUILD/USER_JOINED'), `${moment(member[0].joinedAt).format('lll')} \`${moment(member[0].joinedAt).fromNow()} (${Math.round((new Date() - member[0].joinedAt) / 86400000)} day(s) ago)\``)
			// .addField(bot.translate(settings.Language, 'GUILD/USER_REGISTERED'), `${moment(member[0].user.createdAt).format('lll')} \`${moment(member[0].user.createdAt).fromNow()} (${Math.round((new Date() - member[0].user.createdAt) / 86400000)} day(s) ago)\``)
			// .addField(bot.translate(settings.Language, 'GUILD/USER_PERMISSIONS', member[0].permissions.toArray().length), member[0].permissions.toArray().toString().toLowerCase().replace(/_/g, ' ').replace(/,/g, ' » '))
			// .setTimestamp()
			// .setFooter(bot.translate(settings.Language, 'GUILD/INFO_FOOTER', message.author.tag));
		message.channel.send(embed);
	}
};
