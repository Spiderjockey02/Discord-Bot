// dependencies
const Discord = require('discord.js');
module.exports.run = async (bot, message, args, emoji, settings) => {
	if (!args[0]) {
		// General help page
		const embed = new Discord.MessageEmbed()
			.setColor(0xffffff)
			.setTitle(`${bot.user.username}'s Plugin list.`)
			.addField('Fun', `\`${settings.prefix}help Fun\``, true)
			.addField('Guild', `\`${settings.prefix}help Guild\``, true)
			.addField('Image', `\`${settings.prefix}help Image\``, true)
			.addField('Misc', `\`${settings.prefix}help Misc\``, true);
		if (settings.MusicPlugin == true) {
			embed.addField('Music', `\`${settings.prefix}help Music\``, true);
		}
		if (settings.LevelPlugin == true) {
			embed.addField('Levels', `\`${settings.prefix}help Level\``, true);
		}
		if (settings.ModerationPlugin == true) {
			embed.addField('Moderation', `\`${settings.prefix}help Moderation\``, true);
		}
		if (settings.SearchPlugin) {
			embed.addField('Search', `\`${settings.prefix}help searcher\``, true);
		}
		if (settings.NSFWPlugin) {
			embed.addField('NSFW', `\`${settings.prefix}help nsfw\``, true);
		}
		if (settings.MusicTriviaPlugin) {
			embed.addField('Trivia', `\`${settings.prefix}help Trivia\``, true);
		}
		embed.addField('Plugins', `\`${settings.prefix}help Plugins\``, true);
		message.channel.send(embed);
	} else if (args.length == 1) {
		// Look for command
		if (bot.commands.get(args[0])) {
			const cmd = bot.commands.get(args[0]);
			// Make sure they have the cmd's plugin enabled
			if (cmd.help.category == 'Host' && message.author.id != bot.config.ownerID) return;
			if (cmd.help.category == 'Music' && settings.MusicPlugin == false) return;
			if (cmd.help.category == 'Level' && settings.LevelPlugin == false) return;
			if (cmd.help.category == 'Moderation' && settings.ModerationPlugin == false) return;
			if (cmd.help.category == 'Search' && settings.SearchPlugin == false) return;
			if (cmd.help.category == 'NSFW' && settings.NSFWPlugin == false) return;
			if (cmd.help.category == 'Trivia' && settings.MusicTriviaPlugin == false) return;
			// SHow help on command
			const embed = new Discord.MessageEmbed();
			if (message.guild.icon) {
				embed.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }));
			}
			embed.setAuthor(`${bot.user.username} HELP`, message.guild.iconURL);
			embed.setDescription(`The bot's prefix for this server is: \`${settings.prefix}\`.\n\n**Command name:** \`${cmd.help.name}\`
			**Aliases:** \`${(cmd.config.aliases) ? cmd.config.aliases.join(', ') : 'None'}\`
			**Description:** \`${cmd.help.description}\`
			**Usage:** \`${cmd.help.usage.replace('${PREFIX}', settings.prefix)}\`

			**Layout**: \`<> = required, [] = optional\``);
			message.channel.send(embed);
		} else {
			// Look for plugin
			const embed = new Discord.MessageEmbed()
				.setTitle(`${args[0].charAt(0).toUpperCase() + args[0].slice(1)} plugin`);
			bot.commands.forEach(cmd => {
				if (cmd.help.category == args[0].charAt(0).toUpperCase() + args[0].slice(1)) {
					// Make sure they have the cmd's plugin enabled
					if (cmd.help.category == 'Host' && message.author.id != bot.config.ownerID) return;
					if (cmd.help.category == 'Music' && settings.MusicPlugin == false) return;
					if (cmd.help.category == 'Level' && settings.LevelPlugin == false) return;
					if (cmd.help.category == 'Moderation' && settings.ModerationPlugin == false) return;
					if (cmd.help.category == 'Search' && settings.SearchPlugin == false) return;
					if (cmd.help.category == 'NSFW' && settings.NSFWPlugin == false) return;
					if (cmd.help.category == 'Trivia' && settings.MusicTriviaPlugin == false) return;
					embed.addField(`\`${cmd.help.usage.replace('${PREFIX}', settings.prefix)}\``, cmd.help.description);
				}
			});
			// IF embed is larger than 0 then it is a valid command and wasn't blocked
			if (embed.fields.length != 0) {
				message.channel.send(embed);
			} else if (args[0].charAt(0).toUpperCase() + args[0].slice(1) == 'Plugins') {
				const embed2 = new Discord.MessageEmbed()
					.setTitle('Plugin list for this server')
					.addField('Level plugin', `enabled: \`${settings.LevelPlugin}\``)
					.addField('Music', `enabled: \`${settings.MusicPlugin}\``)
					.addField('Moderation', `enabled: \`${settings.ModerationPlugin}\``)
					.addField('NSFW', `enabled: \`${settings.NSFWPlugin}\``)
					.addField('Search', `enabled: \`${settings.SearchPlugin}\``)
					.addField('Trivia', `enabled: \`${settings.MusicTriviaPlugin}\``);
				message.channel.send(embed2);
			}
		}
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
	usage: '${PREFIX}help',
};
