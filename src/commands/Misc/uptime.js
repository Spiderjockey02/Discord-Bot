// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Uptime extends Command {
	constructor(bot) {
		super(bot, {
			name: 'uptime',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Gets the uptime of the bot.',
			usage: 'uptime',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message) {
		const embed = new MessageEmbed()
			.setDescription(`I have been online for: ${bot.timeFormatter.getReadableTime(bot.uptime)}.`);
		message.channel.send(embed);
	}
};
