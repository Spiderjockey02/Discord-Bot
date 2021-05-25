// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Twitter extends Command {
	constructor(bot) {
		super(bot, {
			name: 'twitter',
			dirname: __dirname,
			aliases: ['tweet'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a fake Twitter tweet.',
			usage: 'twitter [user] <text>',
			cooldown: 5000,
			examples: ['twitter username I don\'t like twitter.'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get user
		const members = await message.getMember();
		if (message.args.join(' ').replace(/<@.?[0-9]*?>/g, '').length == message.args.length) message.args.shift();

		// Get text
		let text = message.args.join(' ');
		text = text.replace(/<@.?[0-9]*?>/g, '');

		// make sure text was entered
		if (message.args.length == 0) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/twitter:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// make sure the text isn't longer than 60 characters
		if (text.length >= 61) return message.channel.error('image/twitter:TOO_LONG').then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=tweet&username=${members[0].user.username}&text=${text}`)).then(res => res.json());

			// send image in embed
			const embed = new Embed(bot, message.guild)
				.setImage(json.message);
			message.channel.send(embed);
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
		msg.delete();
	}
};
