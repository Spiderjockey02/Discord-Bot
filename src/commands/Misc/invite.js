// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Invite extends Command {
	constructor(bot) {
		super(bot, {
			name: 'invite',
			dirname: __dirname,
			aliases: ['inv'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Send an invite link so people can add me to their server.',
			usage: 'invite',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		message.channel.send({ embed:{ description:`[${bot.translate(settings.Language, 'MISC/INVITE_TEXT')}](https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=485846102&scope=bot)` } });
	}
};
