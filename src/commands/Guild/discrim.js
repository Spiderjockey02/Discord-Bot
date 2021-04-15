// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class Discrim extends Command {
	constructor(bot) {
		super(bot, {
			name: 'discrim',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['discriminator'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Discrim',
			usage: 'discrim <discriminator>',
			cooldown: 2000,
			examples: ['discrim 6686'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Make sure a discriminator was entered
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// Get all members with the correct discriminator
		const user = message.guild.members.cache.filter(m => m.user.discriminator === message.args[0]).map(m => m.user.tag);
		message.channel.send(user.join('\n '));
	}
};
