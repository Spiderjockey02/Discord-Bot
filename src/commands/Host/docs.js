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
	async run(bot, message, args) {
		// Get docs information
		const url = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(args)}`;
		get(url).then((embed) => {

			// Display information (if no error)
			const { data } = embed;
			if (data && !data.error) {
				message.channel.send({ embed: data });
			} else {
				message.channel.send('Could not find that documentation.');
			}
		}).catch(err => {
			message.channel.send(err.response.data.message);
		});
	}
};
