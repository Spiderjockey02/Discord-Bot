// Dependencies
const Discord = require('discord.js');
const ameClient = require('amethyste-api');
const ameApi = new ameClient(require('../../config.js').amethysteAPI_KEY);

module.exports.run = async (bot, message, args, emojis) => {
	if (args[0] == 'list' || args[0] == '?') {
		const embed = new Discord.MessageEmbed()
			.setDescription('**1 Image is needed**:\n3000years, approved, beautiful, brazzers, burn, challenger, circle, contrast, crush, ddungeon, dictator, distort, emboss, fire, frame, gay, glitch, greyscale, instagram, invert, jail, magik, missionpassed, moustache, ps4, posterize, rejected, redple, rip, scary, sepia, sharpen, sniper, thanos, tobecontinued, subzero, unsharpen, utatoo, wanted, wasted \n**2 images is needed**:\njdsaklhf');
		message.channel.send(embed);
	} else {
		// Get image, defaults to author's avatar
		const file = bot.GetImage(message);
		const msg = await message.channel.send('Generating your image.');
		try {
			ameApi.generate(args[0], {
				'url' : file,
			}).then(image => {
				// console.log(image);
				const attachment = new Discord.MessageAttachment(image, 'rip.png');
				message.channel.send(attachment);
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
