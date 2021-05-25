// Dependencies
const	{ Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class PHcomment extends Command {
	constructor(bot) {
		super(bot, {
			name: 'phcomment',
			dirname: __dirname,
			aliases: ['ph', 'ph-comment'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a fake Pornhub comment.',
			usage: 'phcomment [user] <text>',
			cooldown: 5000,
			examples: ['phcomment username Wow nice'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get user
		const members = await message.getMember();

		// Get text
		let text = message.args.join(' ');
		text = text.replace(/<@.?[0-9]*?>/g, '');

		// Make sure text was entered
		if (!text) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/phcomment:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// make sure the text isn't longer than 70 characters
		if (text.length >= 71) return message.channel.error('image/phcomment:TOO_LONG').then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=phcomment&username=${members[0].user.username}&image=${members[0].user.displayAvatarURL({ format: 'png', size: 512 })}&text=${text}`)).then(res => res.json());

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
