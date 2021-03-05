// Dependencies
const { MessageEmbed, MessageAttachment } = require('discord.js'),
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
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		if (args[0] == 'list' || args[0] == '?' || !args[0]) {
			const embed = new MessageEmbed()
				.setDescription(message.translate(settings.Language, 'IMAGE/GENERATE_DESC', [`${image_1.join('`, `')}`, `${image_2.join('`, `')}`]));
			message.channel.send(embed);
		} else {
			// Get image, defaults to author's avatar
			const file = message.guild.GetImage(message, args, settings.Language);

			// Check if bot has permission to attach files
			if (!message.channel.permissionsFor(bot.user).has('ATTACH_FILES')) {
				bot.logger.error(`Missing permission: \`ATTACH_FILES\` in [${message.guild.id}].`);
				return message.error(settings.Language, 'MISSING_PERMISSION', 'ATTACH_FILES').then(m => m.delete({ timeout: 10000 }));
			}

			// send 'waiting' message
			let image, msg;
			if (image_1.includes(args[0])) {
				msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');
				// get image
				image = await post(`https://v1.api.amethyste.moe/generate/${args[0]}`, { 'url' : file[0] }, {
					responseType: 'arraybuffer',
					headers: {
						'Authorization': `Bearer ${bot.config.api_keys.amethyste}`,
					},
				}).catch(err => {
					// if an error occured
					msg.delete();
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
				});
			} else if (image_2.includes(args[0])) {
				if (!file[1]) {
					msg.delete();
					return message.error(settings.Language, 'IMAGE/MISSING_ARGS').then(m => m.delete({ timeout: 5000 }));
				}
				msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');
				// get image
				image = await post(`https://v1.api.amethyste.moe/generate/${args[0]}`, { 'avatar': file[1], 'url' : file[0] }, {
					responseType: 'arraybuffer',
					headers: {
						'Authorization': `Bearer ${bot.config.api_keys.amethyste}`,
					},
				}).catch(err => {
					// if an error occured
					msg.delete();
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
				});
			}
			// send embed
			msg.delete();
			const attachment = new MessageAttachment(image.data, `${args[0]}.${args[0] == 'triggered' ? 'gif' : 'png'}`);
			message.channel.send(attachment);
		}
	}
};
