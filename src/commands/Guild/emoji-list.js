// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class EmojiList extends Command {
	constructor(bot) {
		super(bot, {
			name: 'emojilist',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['emoji-list'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays the server\'s emojis',
			usage: 'emojilist',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message) {
		message.channel.send(`**${message.guild.name}'s emoji's:**\n${message.guild.emojis.cache.map(e => e.toString()).join(' ')}`);
	}
};
