// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class Flip extends Command {
	constructor(bot) {
		super(bot, {
			name: 'flip',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Flip a coin.',
			usage: 'flip',
			cooldown: 1000,
			slash: true,
		});
	}

	// Function for message command
	async run(bot, message) {
		const num = Math.round(Math.random()),
			emoji = message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis[['head', 'tail'][num]] : '',
			result = message.translate(`fun/flip:${num < 0.5 ? 'HEADS' : 'TAILS'}`);

		// send result
		message.channel.send(`${emoji} ${result}`);
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelId),
			num = Math.round(Math.random()),
			emoji = channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis[['head', 'tail'][num]] : '',
			result = guild.translate(`fun/flip:${num < 0.5 ? 'HEADS' : 'TAILS'}`);

		// send result
		return interaction.reply({ content: `${emoji} ${result}` });
	}
};
