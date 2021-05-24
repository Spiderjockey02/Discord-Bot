// Dependencies
const	{ MessageAttachment } = require('discord.js'),
	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class QRcode extends Command {
	constructor(bot) {
		super(bot, {
			name: 'qrcode',
			dirname: __dirname,
			aliases: ['qr-code'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a QR code.',
			usage: 'qrcode <text / file>',
			cooldown: 5000,
			examples: ['qrcode https://www.google.com/', 'qrcode <attachment>'],
		});
	}

	// Run command
	async run(bot, message) {
		// Get text for QR encoding (including file URl)
		const text = (!message.args[0]) ? await message.getImage().then(r => r[0]) : message.args.join(' ');

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const attachment = new MessageAttachment(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${text.replace(new RegExp(' ', 'g'), '%20')}`, 'QRCODE.png');
			// send image in embed
			const embed = new Embed(bot, message.guild)
				.attachFiles(attachment)
				.setImage('attachment://QRCODE.png');
			message.channel.send(embed);
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
		msg.delete();
	}
};
