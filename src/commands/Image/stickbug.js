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
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a stickbug meme.',
			usage: 'stickbug [file]',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get image, defaults to author's avatar
		const file = message.guild.GetImage(message, args, settings.Language);

		// send 'waiting' message
		const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

		// Try and convert image
		//	console.log(`https://gsbl.sujalgoel.ml/?image=${file[0]}`);
		try {
			const res = await fetch(encodeURI(`http://localhost:3000?image=${file[0].slice(0, file[0].length - 10)}`));
			const json = await res.json();
			// send image in embed
			const attachment = new MessageAttachment(json.video, 'stickbug.mp4');
			message.channel.send(attachment);
			msg.delete();
		} catch(err) {
			console.log(err);
			// if an error occured
			if (bot.config.debug) bot.logger.error(`${err.message} - command: stickbug.`);
			msg.delete();
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
