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
		const member = message.getMember();

		// send embed
		const embed = new Embed(message)
			.setTitle('guild/avatar:AVATAR_TITLE', { USER: member[0].user.tag })
			.setDescription([
				`${message.translate('guild/avatar:AVATAR_DESCRIPTION')}`,
				`[png](${member[0].user.displayAvatarURL({ format: 'png', size: 1024 })}) | [jpg](${member[0].user.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [gif](${member[0].user.displayAvatarURL({ format: 'gif', size: 1024, dynamic: true })}) | [webp](${member[0].user.displayAvatarURL({ format: 'webp', size: 1024 })})`,
			].join('\n'))
			.setImage(`${member[0].user.displayAvatarURL({ dynamic: true, size: 1024 })}`);
		message.channel.send(embed);
	}
};
