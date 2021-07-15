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
			examples: ['generate 3000years username', 'generate beautiful <attachment>', 'generate list'],
		});
	}

	// Run command
	async run(bot, message) {
		// If user wants to see generate list
		if (!message.args || ['list', '?'].includes(message.args[0])) {
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('image/generate:DESC', { IMG_1: `${image_1.join('`, `')}`, IMG_2: `${image_2.join('`, `')}` }));
			return message.channel.send({ embeds: [embed] });
		}

		// Get image, defaults to author's avatar
		const choice = message.args[0];
		message.args.shift();
		const files = await message.getImage();
		if (!Array.isArray(files)) return;

		// Check if 2 images are needed
		if (image_2.includes(choice) && !files[1]) return message.channel.error('image/generate:NEED_2IMG').then(m => m.timedDelete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

		// get image
		const options = image_1.includes(choice) ? { 'url' : files[0] } : { 'avatar': files[1], 'url' : files[0] };
		const image = await post(`https://v1.api.amethyste.moe/generate/${choice}`, options, {
			responseType: 'arraybuffer',
			headers: {
				'Authorization': `Bearer ${bot.config.api_keys.amethyste}`,
			},
		}).catch(err => {
			// if an error occured
			msg.delete();
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		});

		// send embed
		try {
			if (!image || !image.data) return;
			const attachment = new MessageAttachment(image.data, `${choice}.${choice == 'triggered' ? 'gif' : 'png'}`);
			msg.delete();
			message.channel.send({ files: [attachment] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
};
