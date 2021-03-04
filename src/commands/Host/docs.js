// Dependencies
const { get } = require('axios'),
	Command = require('../../structures/Command.js');

module.exports = class Docs extends Command {
	constructor(bot) {
		super(bot, {
			name: 'docs',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays Discord.js documentation.',
			usage: 'docs <query>',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get docs information
		const url = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(args)}`;
		get(url).then(({ data }) => {

			// Display information (if no error)
			if (data && !data.error) {
				message.channel.send({ embed: data });
			} else {
				message.channel.send('Could not find that documentation.');
			}
		}).catch(err => {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.response.data.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		});
	}
};
