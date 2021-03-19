// Dependencies
const { MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Blurpify extends Command {
	constructor(bot) {
		super(bot, {
			name: 'blurpify',
			dirname: __dirname,
			aliases: ['blurp'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Blurpify an image.',
			usage: 'blurpify [file]',
			cooldown: 5000,
			examples: ['blurpify <attachment>', 'blurpify username'],
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
			const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${file[0]}`));
			const json = await res.json();
			// send image
			const embed = new MessageEmbed()
				.setColor(3447003)
				.setImage(json.message);
			message.channel.send(embed);
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
		msg.delete();
	}
};
