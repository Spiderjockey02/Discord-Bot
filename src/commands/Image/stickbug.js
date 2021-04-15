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
			examples: ['stickbug username', 'stickbug <attachment>'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get image, defaults to author's avatar
		const file = await message.getImage();

		// Check if bot has permission to attach files
		if (!message.channel.permissionsFor(bot.user).has('ATTACH_FILES')) {
			bot.logger.error(`Missing permission: \`ATTACH_FILES\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'ATTACH_FILES').then(m => m.delete({ timeout: 10000 }));
		}

		// send 'waiting' message
		const msg = await message.channel.send(bot.translate(settings.Language, 'IMAGE/GENERATING_IMAGE'));

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
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
