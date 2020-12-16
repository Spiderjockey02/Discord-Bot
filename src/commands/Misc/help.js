// Dependencies
const { MessageEmbed } = require('discord.js');

// Check what plugins are running on the server
function checkPlugins(settings) {
	const plugins = [];
	if (settings.MusicPlugin) plugins.push('Music');
	if (settings.LevelPlugin) plugins.push('Level');
	if (settings.ModerationPlugin) plugins.push('Moderation');
	if (settings.SearchPlugin) plugins.push('Search');
	if (settings.NSFWPlugin) plugins.push('Nsfw');
	if (settings.MusicTriviaPlugin) plugins.push('Trivia');
	return plugins;
}

module.exports.run = async (bot, message, args, settings) => {
	const plugins = checkPlugins(settings);
	if (!args[0]) {
		// Show default help page
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setThumbnail(bot.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
			.setTitle(`${bot.user.username}'s Plugin list.`)
			.addField('Fun', `\`${settings.prefix}help Fun\``, true)
			.addField('Guild', `\`${settings.prefix}help Guild\``, true)
			.addField('Image', `\`${settings.prefix}help Image\``, true)
			.addField('Misc', `\`${settings.prefix}help Misc\``, true)
			.addField('Plugins', `\`${settings.prefix}help Plugins\``, true);
		for (let i = 0; i < plugins.length; i++) {
			embed.addField(plugins[i], `\`${settings.prefix}help ${plugins[i]}\``, true);
		}
		embed.addField('Plugins', `\`${settings.prefix}help plugin-list\``, true);
		message.channel.send(embed);
	} else if (args.length == 1) {
		// Check if arg is command
		if (bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]))) {
			// arg was a command
			const cmd = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
			// Check if the command is allowed on the server
			if (plugins.includes(cmd.help.category) || ['Fun', 'Guild', 'Image', 'Misc', 'Plugins'].includes(cmd.help.category) || message.author.id == bot.config.ownerID) {
				const embed = new MessageEmbed()
					.setThumbnail(message.guild.iconURL())
					.setAuthor(`${bot.user.username} HELP`, message.guild.iconURL)
					.setDescription(`The bot's prefix for this server is: \`${settings.prefix}\`.\n\n**Command name:** \`${cmd.help.name}\`
						**Aliases:** \`${(cmd.config.aliases) ? cmd.config.aliases.join(', ') : 'None'}\`
						**Description:** \`${cmd.help.description}\`
						**Usage:** \`${cmd.help.usage.replace('${PREFIX}', settings.prefix)}\`

						**Layout**: \`<> = required, [] = optional\``);
				message.channel.send(embed);
			} else {
				message.error(settings.Language, 'MISC/NO_COMMAND');
			}
		} else {
			// arg is likely to be plugin
			const embed = new MessageEmbed()
				.setTitle(`${args[0].charAt(0).toUpperCase() + args[0].slice(1)} Plugin`);
			bot.commands.forEach(cmd => {
				if (cmd.help.category == args[0].charAt(0).toUpperCase() + args[0].slice(1)) {
					embed.addField(`\`${cmd.help.usage.replace('${PREFIX}', settings.prefix)}\``, cmd.help.description);
				}
			});
			// Check if embed is empty
			if (embed.fields.length != 0) {
				message.channel.send(embed);
			} else if (args[0].charAt(0).toUpperCase() + args[0].slice(1) == 'Plugin-list') {
				const embed2 = new MessageEmbed()
					.setTitle('Plugin list for this server')
					.addField('Level plugin', `enabled: \`${settings.LevelPlugin}\``)
					.addField('Music', `enabled: \`${settings.MusicPlugin}\``)
					.addField('Moderation', `enabled: \`${settings.ModerationPlugin}\``)
					.addField('NSFW', `enabled: \`${settings.NSFWPlugin}\``)
					.addField('Search', `enabled: \`${settings.SearchPlugin}\``)
					.addField('Trivia', `enabled: \`${settings.MusicTriviaPlugin}\``);
				message.channel.send(embed2);
			} else {
				message.error(settings.Language, 'MISC/MISSING_COMMAND');
			}
		}
	} else {
		message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('help').help.usage.replace('${PREFIX}', settings.prefix));
	}
};

module.exports.config = {
	command: 'help',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'help',
	category: 'Misc',
	description: 'Sends information about all the commands that I can do.',
	usage: '${PREFIX}help [command | plugin]',
};
