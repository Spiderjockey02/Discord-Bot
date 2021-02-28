// Dependencies
const { MessageEmbed } = require('discord.js'),
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
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get user
		const member = message.guild.getMember(message, args);

		// send 'waitng' message
		const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

		// Try and convert image
		try {
			const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=captcha&username=${member[0].user.username}&url=${member[0].user.displayAvatarURL({ format: 'png', size: 512 })}`));
			const json = await res.json();
			// send image
			const embed = new MessageEmbed()
				.setColor(9807270)
				.setImage(json.message);
			message.channel.send(embed);
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
		msg.delete();
	}
};
