// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Captcha extends Command {
	constructor(bot) {
		super(bot, {
			name: 'captcha',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a captcha image.',
			usage: 'captcha',
			cooldown: 5000,
			examples: ['captcha userID', 'captcha @mention', 'captcha username'],
		});
	}

	// Run command
	async run(bot, message) {
		// Get user
		const members = await message.getMember();

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=captcha&username=${members[0].user.username}&url=${members[0].user.displayAvatarURL({ format: 'png', size: 512 })}`)).then(res => res.json());

			// send image
			const embed = new Embed(bot, message.guild)
				.setColor(9807270)
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
