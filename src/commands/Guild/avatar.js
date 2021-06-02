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
		});
	}

	// Run command
	async run(bot, message) {
		// Get user
		const members = await message.getMember();

		// send embed
		const embed = new Embed(bot, message.guild)
			.setTitle('guild/avatar:AVATAR_TITLE', { USER: members[0].user.tag })
			.setDescription([
				`${message.translate('guild/avatar:AVATAR_DESCRIPTION')}`,
				`[png](${members[0].user.displayAvatarURL({ format: 'png', size: 1024 })}) | [jpg](${members[0].user.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [gif](${members[0].user.displayAvatarURL({ format: 'gif', size: 1024, dynamic: true })}) | [webp](${members[0].user.displayAvatarURL({ format: 'webp', size: 1024 })})`,
			].join('\n'))
			.setImage(`${members[0].user.displayAvatarURL({ dynamic: true, size: 1024 })}`);
		message.channel.send(embed);
	}
};
