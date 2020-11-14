// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
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
};

module.exports.config = {
	command: 'guildicon',
	aliases: ['servericon'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Guildicon',
	category: 'Guild',
	description: 'Get the server\'s icon.',
	usage: '${PREFIX}guildicon',
};
