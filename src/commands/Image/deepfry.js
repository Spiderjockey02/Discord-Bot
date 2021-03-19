// Dependencies
const { MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Deepfry extends Command {
	constructor(bot) {
		super(bot, {
			name: 'deepfry',
			dirname: __dirname,
			aliases: ['deep-fry'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Deepfry an image.',
			usage: 'deepfry [file]',
			cooldown: 5000,
			examples: ['deepfry <attachment>', 'deepfry username'],
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
			const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=deepfry&image=${file[0]}`));
			const json = await res.json();
			// send image
			const embed = new MessageEmbed()
				.setColor(15105570)
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
