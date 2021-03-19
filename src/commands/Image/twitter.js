// Dependencies
const { MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Twitter extends Command {
	constructor(bot) {
		super(bot, {
			name: 'twitter',
			dirname: __dirname,
			aliases: ['tweet'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a fake Twitter tweet.',
			usage: 'twitter [user] <text>',
			cooldown: 5000,
			examples: ['twitter username I don\'t like twitter.'],
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get user
		const member = message.guild.getMember(message, args);
		if (args.join(' ').replace(/<@.?[0-9]*?>/g, '').length == args.length) args.shift();

		// Get text
		let text = args.join(' ');
		text = text.replace(/<@.?[0-9]*?>/g, '');

		// make sure text was entered
		if (args.length == 0) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// make sure the text isn't longer than 60 characters
		if (text.length >= 61) return message.error(settings.Language, 'IMAGE/TEXT_OVERLOAD', 60).then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message
		const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

		// Try and convert image
		try {
			const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=tweet&username=${member[0].user.username}&text=${text}`));
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
