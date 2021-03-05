// Dependencies
const	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Update extends Command {
	constructor(bot) {
		super(bot, {
			name: 'update',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Sends an update to bot\'s guild.',
			usage: 'update',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args) {
		// Embed for update
		const embed = new MessageEmbed()
			.setTitle(`${bot.user.tag} update logs`)
			.setDescription((args[0]) ? args.join(' ') : 'unspecified');

		// find a channel of each guild
		bot.guilds.cache.forEach(guild => {
			for (let i = 0; i < guild.channels.cache.array().length; i++) {
				try {
					if (!['voice', 'category', 'news', 'store', 'unknown'].includes(guild.channels.cache.array()[i].type)) {
						embed.setFooter(`Turn off notifications by running ${guild.settings.prefix}notifs off`);
						guild.channels.cache.array()[i].send(embed);
						break;
					}
				} catch (e) {
					console.log(e);
					return;
				}
			}
		});
	}
};
