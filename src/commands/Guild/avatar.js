// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Avatar extends Command {
	constructor(bot) {
		super(bot, {
			name: 'avatar',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['av'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays user\'s avatar.',
			usage: 'avatar [user]',
			cooldown: 2000,
			examples: ['avatar userID', 'avatar @mention', 'avatar username'],
			slash: true,
			options: [{
				name: 'user',
				description: 'The user you want to grab the avatar of.',
				type: 'USER',
				required: false,
			}],
		});
	}

	// Function for message command
	async run(bot, message) {
		// Get avatar embed
		const members = await message.getMember();
		const embed = this.avatarEmbed(bot, message.guild, members[0]);

		// send embed
		message.channel.send({ embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
		const embed = this.avatarEmbed(bot, guild, member);

		// send embed
		return await bot.send(interaction, { embeds: [embed] });
	}

	// create avatar embed
	avatarEmbed(bot, guild, member) {
		const embed = new Embed(bot, guild)
			.setTitle('guild/avatar:AVATAR_TITLE', { USER: member.user.tag })
			.setDescription([
				`${bot.translate('guild/avatar:AVATAR_DESCRIPTION')}`,
				`[png](${member.user.displayAvatarURL({ format: 'png', size: 1024 })}) | [jpg](${member.user.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [gif](${member.user.displayAvatarURL({ format: 'gif', size: 1024, dynamic: true })}) | [webp](${member.user.displayAvatarURL({ format: 'webp', size: 1024 })})`,
			].join('\n'))
			.setImage(`${member.user.displayAvatarURL({ dynamic: true, size: 1024 })}`);
		return embed;
	}
};
