// Dependencies
const	{ MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class PHcomment extends Command {
	constructor(bot) {
		super(bot, {
			name: 'phcomment',
			dirname: __dirname,
			aliases: ['ph', 'ph-comment'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a fake Pornhub comment.',
			usage: 'phcomment [user] <text>',
			cooldown: 5000,
			examples: ['phcomment username Wow nice'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get user
		const member = message.getMember();
		// Get text
		let text = message.args.join(' ');
		text = text.replace(/<@.?[0-9]*?>/g, '');

		// Make sure text was entered
		if (!text) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));

		// make sure the text isn't longer than 70 characters
		if (text.length >= 71) return message.channel.error(settings.Language, 'IMAGE/TEXT_OVERLOAD', 70).then(m => setTimeout(() => { m.delete(); }, 5000));

		// send 'waiting' message
		const msg = await message.channel.send(`${message.checkEmoji() ? bot.customEmojis['loading'] : ''} ${bot.translate(settings.Language, 'IMAGE/GENERATING_IMAGE')}`);

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=phcomment&username=${member[0].user.username}&image=${member[0].user.displayAvatarURL({ format: 'png', size: 512 })}&text=${text}`)).then(res => res.json());

			// send image in embed
			const embed = new MessageEmbed()
				.setImage(json.message);
			message.channel.send(embed);
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
		}
		msg.delete();
	}
};
