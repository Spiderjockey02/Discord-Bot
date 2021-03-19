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
			cooldown: 5000,
			examples: ['ship username username', 'ship username <attachment>'],
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get image, defaults to author's avatar
		const users = message.guild.GetImage(message, args, settings.Language);

		// send 'waitng' message
		const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

		// Try and convert image
		try {
			const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=ship&user1=${users[0].user.displayAvatarURL({ format: 'png', size: 512 })}&user2=${users[1].user.displayAvatarURL({ format: 'png', size: 512 })}`));
			const json = await res.json();

			// send image
			const embed = new MessageEmbed()
				.setImage(json.message);
			msg.delete();
			message.channel.send(embed);
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
