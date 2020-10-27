// Dependencies
const Discord = require('discord.js');
const ameClient = require('amethyste-api');
const ameApi = new ameClient(require('../../config.js').amethysteAPI_KEY);

module.exports.run = async (bot, message, args, emojis) => {
	if (args[0] == 'list') {
		message.channel.send('3000years, approved, afusion, batslap, beautiful, brazzers, burn, challenger, contrast, crush, ddungeon, dictator, distort, dither565, emboss, fire, frame, gay, glitch, greyscale, instagram, invert, jail, lookwhatkarenhave, magik, missionpassed, moustache, ps4, posterize, rejected, rip, scary, sepia, sharpen, sniper, thanos, tobecontinued, subzero, triggered, unsharpen, utatoo, vs, wanted, wasted');
	} else {
		// Get image, defaults to author's avatar
		const file = bot.GetImage(message);
		const msg = await message.channel.send('Generating your image.');
		try {
			console.log(require('../../config.js').amethysteAPI_KEY);
			ameApi.generate(args[0], {
				'url' : 'https://cdn.discordapp.com/avatars/450352584302002186/c0ff7e943ab89560503b8e99591ff888.png?size=2048',
			}).then(image => {
				console.log(image);
			}).catch(err => {
				console.log(err);
			});
		} catch(e) {
			// if an error occured
			console.log(e);
			msg.delete();
			message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
		}
	}
};

module.exports.config = {
	command: 'generate',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Generate',
	category: 'Image',
	description: 'Generate a custom image',
	usage: '${PREFIX}generate <option> [image]',
};
