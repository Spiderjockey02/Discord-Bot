// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class Dashboard extends Command {
	constructor(bot) {
		super(bot, {
			name: 'dashboard',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['db'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Sends a link to your Server\'s dashboard.',
			usage: 'dashboard',
			cooldown: 2000,
			slash: true,
		});
	}

	// Run command
	async run(bot, message) {
		message.channel.send(`${bot.config.websiteURL}/dashboard/${message.guild.id}`);
	}
	async callback(bot, interaction, guild) {
		bot.send(interaction, `${bot.config.websiteURL}/dashboard/${guild.id}`);
	}
};
