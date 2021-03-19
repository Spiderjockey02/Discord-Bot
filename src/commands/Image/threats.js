// Dependencies
const { MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Threats extends Command {
	constructor(bot) {
		super(bot, {
			name: 'threats',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Creates a threat meme.',
			usage: 'threats [image]',
			cooldown: 5000,
			examples: ['threats username', 'threats <attachment>'],
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get image, defaults to author's avatar
		const file = message.guild.GetImage(message, args, settings.Language);

		// send 'waiting' message
		const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

		// Try and convert image
		try {
			const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=threats&url=${file[0]}`));
			const json = await res.json();
			// send image in embed
			const embed = new MessageEmbed()
				.setImage(json.message);
			msg.delete();
			message.channel.send(embed);
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
