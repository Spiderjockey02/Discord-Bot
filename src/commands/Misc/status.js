// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Status extends Command {
	constructor(bot) {
		super(bot, {
			name: 'status',
			dirname: __dirname,
			aliases: ['stat', 'ping'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Gets the status of the bot.',
			usage: 'status',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message) {
		// Get information on the services the bot provide
		const m = await message.channel.send('Pong');

		const embed = new MessageEmbed()
			.addField(bot.translate('misc/status:PING'), `\`${m.createdTimestamp - message.createdTimestamp}ms\``, true)
			.addField(bot.translate('misc/status:CLIENT'), `\`${Math.round(bot.ws.ping)}ms\``, true)
			.addField(bot.translate('misc/status:MONGO'), `\`${Math.round(await bot.mongoose.ping())}ms\``, true)
			.setTimestamp();
		await message.channel.send(embed);
		m.delete();
	}
};
