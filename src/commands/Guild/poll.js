// Dependencies
const { Embed } = require('../../structures'),
	Command = require('../../structures/Command.js');

module.exports = class Poll extends Command {
	constructor(bot) {
		super(bot, {
			name:  'poll',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
			description: 'Create a poll for users to answer.',
			usage: 'poll <question>',
			cooldown: 2000,
			examples: ['poll Is this a good bot?'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check bot for add reaction permission
		if (!message.channel.permissionsFor(bot.user).has('ADD_REACTIONS')) {
			bot.logger.error(`Missing permission: \`ADD_REACTIONS\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'ADD_REACTIONS').then(m => m.delete({ timeout: 10000 }));
		}

		// Make sure a poll was provided
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('guild/poll:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// Send poll to channel
		const embed = new Embed(message)
			.setColor(0xffffff)
			.setTitle('guild/poll:TITLE', { USER: message.author.tag })
			.setDescription(message.args.join(' '))
			.setFooter('guild/poll:FOOTER', {});
		message.channel.send(embed).then(async (msg) => {
			// Add reactions to message
			await msg.react('✅');
			await msg.react('❌');
		});
	}
};
