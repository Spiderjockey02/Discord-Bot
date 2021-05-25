// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Privacy extends Command {
	constructor(bot) {
		super(bot, {
			name: 'privacy',
			dirname: __dirname,
			aliases: ['priv'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Sends a link to the privacy policy.',
			usage: 'privacy',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message) {
		// Send link to privacy policy
		message.channel.send({ embed:{ description:message.translate('misc/privacy:LINK', { LINK: 'https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/PRIVACY.md' }) } });
	}
};
