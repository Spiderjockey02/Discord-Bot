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
			description: 'Get information on a user.',
			usage: 'user-info [user]',
			cooldown: 2000,
			examples: ['user-info userID', 'user-info @mention', 'user-info username'],
			slash: true,
			options: [{
				name: 'user',
				description: 'The user you want to get information of',
				type: 'USER',
				required: false,
			}],
		});
	}

	// Function for message command
	async run(bot, message) {
		// Get user
		const members = await message.getMember();
		const embed = this.createEmbed(bot, message.guild, members[0]);

		// send user info
		message.channel.send({ embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);

		// send embed
		const embed = await this.createEmbed(bot, guild, member);
		interaction.reply({ embeds: [embed] });
	}


	// create userinfo embed
	createEmbed(bot, guild, member) {
		const status = (member.presence?.activities.length >= 1) ? `${member.presence.activities[0].name} - ${(member.presence.activities[0].type == 'CUSTOM_STATUS') ? member.presence.activities[0].state : member.presence.activities[0].details}` : 'None';
		return new Embed(bot, guild)
			.setAuthor(member.user.tag, member.user.displayAvatarURL())
			.setColor(3447003)
			.setThumbnail(member.user.displayAvatarURL({ format: 'png', size: 512 }))
			.addFields(
				{ name: guild.translate('guild/user-info:USERNAME'), value: member.user.username, inline: true },
				{ name: guild.translate('guild/user-info:DISCRIM'), value: `${member.user.discriminator}`, inline: true },
				{ name: guild.translate('guild/user-info:ROBOT'), value: guild.translate(`misc:${member.user.bot ? 'YES' : 'NO'}`), inline: true },
				{ name: guild.translate('guild/user-info:CREATE'), value: moment(member.user.createdAt).format('lll'), inline: true },
				{ name: guild.translate('guild/user-info:STATUS'), value: `\`${status}\``, inline: true },
				{ name: guild.translate('guild/user-info:ROLE'), value: `${member.roles.highest}`, inline: true },
				{ name: guild.translate('guild/user-info:JOIN'), value: moment(member.joinedAt).format('lll'), inline: true },
				{ name: guild.translate('guild/user-info:NICK'), value: member.nickname != null ? member.nickname : guild.translate('misc:NONE'), inline: true },
				{ name: guild.translate('guild/user-info:ROLES'), value: member.roles.cache.sort((a, b) => b.rawPosition - a.rawPosition).reduce((a, b) => `${a}, ${b}`) },
			);
	}
};
