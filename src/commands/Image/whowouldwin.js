// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class WhoWouldWin extends Command {
	constructor(bot) {
		super(bot, {
			name: 'whowouldwin',
			dirname: __dirname,
			aliases: ['www'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a whowouldwin image.',
			usage: 'whowouldwin <user1> [user2]',
			cooldown: 5000,
			examples: ['whowouldwin username username', 'whowouldwin username <attachment>'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get user
		const members = await message.getImage();
		if (!members[1]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/ship:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=whowouldwin&user1=${members[0]}&user2=${members[1]}`)).then(res => res.json());

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
