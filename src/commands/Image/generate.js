// Dependencies
const { MessageAttachment } = require('discord.js'),
	{ Embed } = require('../../utils'),
	{ post } = require('axios'),
	Command = require('../../structures/Command.js');

// image types
const image_1 = ['3000years', 'approved', 'beautiful', 'brazzers', 'burn', 'challenger', 'circle', 'contrast', 'crush', 'ddungeon', 'dictator', 'distort', 'emboss', 'fire', 'frame', 'gay',
	'glitch', 'greyscale', 'instagram', 'invert', 'jail', 'magik', 'missionpassed', 'moustache', 'ps4', 'posterize', 'rejected', 'redple', 'rip', 'scary', 'sepia', 'sharpen', 'sniper', 'thanos',
	'tobecontinued', 'triggered', 'subzero', 'unsharpen', 'utatoo', 'wanted', 'wasted'];
const image_2 = ['afusion', 'batslap', 'vs'];

module.exports = class Generate extends Command {
	constructor(bot) {
		super(bot, {
			name: 'generate',
			dirname: __dirname,
			aliases: ['gen'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
			description: 'Generate a custom image.',
			usage: 'generate <option> [image]',
			cooldown: 5000,
			examples: ['generate 3000years username', 'generate beautiful <attachment>'],
		});
	}

	// Run command
	async run(bot, message) {
		if (message.args[0] == 'list' || message.args[0] == '?' || !message.args[0]) {
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('image/generate:DESC', { IMG_1: `${image_1.join('`, `')}`, IMG_2: `${image_2.join('`, `')}` }));
			message.channel.send(embed);
		} else {
			// Get image, defaults to author's avatar
			const choice = message.args[0];
			message.args.shift();
			const file = await message.getImage();

			// send 'waiting' message
			let image, msg;
			if (image_1.includes(choice)) {
				// send 'waiting' message to show bot has recieved message
				msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
					EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

				// get image
				image = await post(`https://v1.api.amethyste.moe/generate/${choice}`, { 'url' : file[0] }, {
					responseType: 'arraybuffer',
					headers: {
						'Authorization': `Bearer ${bot.config.api_keys.amethyste}`,
					},
				}).catch(err => {
					// if an error occured
					msg.delete();
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
				});
			} else if (image_2.includes(choice)) {
				// Check that 2 files have been uploaded
				if (!file[1]) return message.channel.error('image/generate:NEED_2IMG').then(m => m.delete({ timeout: 5000 }));

				// send 'waiting' message to show bot has recieved message
				msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
					EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

				// get image
				image = await post(`https://v1.api.amethyste.moe/generate/${choice}`, { 'avatar': file[1], 'url' : file[0] }, {
					responseType: 'arraybuffer',
					headers: {
						'Authorization': `Bearer ${bot.config.api_keys.amethyste}`,
					},
				}).catch(err => {
					// if an error occured
					msg.delete();
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
				});
			}
			// send embed
			try {
				if (!image || !image.data) return;
				const attachment = new MessageAttachment(image.data, `${choice}.${choice == 'triggered' ? 'gif' : 'png'}`);
				msg.delete();
				message.channel.send(attachment);
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				msg.delete();
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		}
	}
};
