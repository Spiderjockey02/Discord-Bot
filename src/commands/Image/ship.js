// Dependencies
const { MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Ship extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ship',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a ship image.',
			usage: 'ship <user1> [user2]',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get image, defaults to author's avatar
		const user1 = message.guild.GetImage(message, args, settings.Language);
		if (!user1) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('phcomment').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
		const user2 = (args[1]) ? message.mentions.users.array()[1] : message.author;
		// send 'waitng' message

		const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

		// Try and convert image
		try {
			const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=ship&user1=${user1[0]}&user2=${user2.displayAvatarURL({ format: 'png', size: 512 })}`));
			const json = await res.json();
			// send image
			const embed = new MessageEmbed()
				.setImage(json.message);
			msg.delete();
			message.channel.send(embed);
		} catch(err) {
			// if an error occured
			if (bot.config.debug) bot.logger.error(`${err.message} - command: ship.`);
			msg.delete();
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
