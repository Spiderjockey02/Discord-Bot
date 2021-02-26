// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Guildicon extends Command {
	constructor(bot) {
		super(bot, {
			name:  'guildicon',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['servericon'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get the server\'s icon.',
			usage: 'guildicon',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Check for guild icon & send message
		if (message.guild.icon) {
			const embed = new MessageEmbed()
				.setDescription(`[${message.translate(settings.Language, 'GUILD/GUILD_ICON')}](${message.guild.iconURL({ dynamic: true, size: 1024 })})`)
				.setImage(message.guild.iconURL({ dynamic: true, size: 1024 }));
			message.channel.send(embed);
		} else {
			if (message.deletable) message.delete();
			message.error(settings.Language, 'GUILD/NO_GUILD_ICON').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
