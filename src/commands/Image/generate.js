// Dependencies
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { post } = require('axios');

// image types
const image_1 = ['3000years', 'approved', 'beautiful', 'brazzers', 'burn', 'challenger', 'circle', 'contrast', 'crush', 'ddungeon', 'dictator', 'distort', 'emboss', 'fire', 'frame', 'gay',
	'glitch', 'greyscale', 'instagram', 'invert', 'jail', 'magik', 'missionpassed', 'moustache', 'ps4', 'posterize', 'rejected', 'redple', 'rip', 'scary', 'sepia', 'sharpen', 'sniper', 'thanos',
	'tobecontinued', 'triggered', 'subzero', 'unsharpen', 'utatoo', 'wanted', 'wasted'];

const image_2 = ['afusion', 'batslap', 'vs'];

module.exports.run = async (bot, message, args, settings) => {
	if (args[0] == 'list' || args[0] == '?' || !args[0]) {
		const embed = new MessageEmbed()
			.setDescription(message.translate(settings.Language, 'IMAGE/GENERATE_DESC', [`${image_1.join('`, `')}`, `${image_2.join('`, `')}`]));
		message.channel.send(embed);
	} else {
		// Get image, defaults to author's avatar
		const file = bot.GetImage(message, args, settings.Language);
		// send 'waiting' message
		const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');
		let image;
		if (image_1.includes(args[0])) {
			// get image
			image = await post(`https://v1.api.amethyste.moe/generate/${args[0]}`, { 'url' : file[0] }, {
				responseType: 'arraybuffer',
				headers: {
					'Authorization': `Bearer ${bot.config.api_keys.amethyste}`,
				},
			}).catch(err => {
				// if an error occured
				if (bot.config.debug) bot.logger.error(`${err.message} - command: generate.`);
				msg.delete();
				message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			});
		} else if (image_2.includes(args[0])) {
			// get image
			console.log(file);
			image = await post(`https://v1.api.amethyste.moe/generate/${args[0]}`, { 'avatar': file[1], 'url' : file[0] }, {
				responseType: 'arraybuffer',
				headers: {
					'Authorization': `Bearer ${bot.config.api_keys.amethyste}`,
				},
			}).catch(e => {
				// if an error occured
				bot.logger.error(e.message);
				msg.delete();
				message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			});
		}
		// send embed
		msg.delete();
		const attachment = new MessageAttachment(image.data, `${args[0]}.${args[0] == 'triggered' ? 'gif' : 'png'}`);
		message.channel.send(attachment);
	}
};

module.exports.config = {
	command: 'generate',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Generate',
	category: 'Image',
	description: 'Generate a custom image.',
	usage: '${PREFIX}generate <option> [image]',
};
