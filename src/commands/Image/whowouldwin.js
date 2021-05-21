// Dependencies
const { MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class WhoWouldWin extends Command {
	constructor(bot) {
		super(bot, {
			name: 'whowouldwin',
			dirname: __dirname,
			aliases: ['www'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a whowouldwin image.',
			usage: 'whowouldwin <user1> [user2]',
			cooldown: 5000,
			examples: ['whowouldwin username username', 'whowouldwin username <attachment>'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get user
		const member = message.getMember();

		// send 'waiting' message
		const msg = await message.channel.send(`${message.checkEmoji() ? bot.customEmojis['loading'] : ''} ${bot.translate(settings.Language, 'IMAGE/GENERATING_IMAGE')}`);

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=whowouldwin&user1=${member[0].user.displayAvatarURL({ format: 'png', size: 512 })}&user2=${member[1].user.displayAvatarURL({ format: 'png', size: 512 })}`)).then(res => res.json());

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
