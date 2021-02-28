// Dependencies
const { MessageAttachment } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Stickbug extends Command {
	constructor(bot) {
		super(bot, {
			name: 'stickbug',
			dirname: __dirname,
			aliases: ['stick-bug'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
			description: 'Create a stickbug meme.',
			usage: 'stickbug [file]',
			cooldown: 5000,
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
			const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=stickbug&url=${file[0]}`));
			const json = await res.json();
			// send image in embed
			const attachment = new MessageAttachment(json.message, 'stickbug.mp4');
			message.channel.send(attachment);
			msg.delete();
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
