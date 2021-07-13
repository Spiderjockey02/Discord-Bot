// Dependencies
const { get } = require('axios'),
	Command = require('../../structures/Command.js');

module.exports = class Docs extends Command {
	constructor(bot) {
		super(bot, {
			name: 'docs',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays Discord.js documentation.',
			usage: 'docs <query>',
			cooldown: 3000,
			examples: ['docs channel#create'],
		});
	}

	// Run command
	async run(bot, message) {
		// Get docs information
		get(`https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(message.args.join(' '))}`)
			.then(({ data }) => {
			// Display discord.js docs (if any)
				if (data && !data.error) {
					message.channel.send({ embeds: [data] });
				} else {
					message.channel.error('host/docs:MISSING');
				}
			}).catch(err => {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			});
	}
};
