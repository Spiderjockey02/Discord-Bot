// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Help extends Command {
	constructor(bot) {
		super(bot, {
			name: 'help',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Sends information about all the commands that I can do.',
			usage: 'help [command | plugin]',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		if (!args[0]) {
			// Show default help page
			const embed = new MessageEmbed()
				.setAuthor('Available commands', bot.user.displayAvatarURL({ format: 'png' }))
				.setDescription([
					`**Prefix:** \`${settings.prefix}\` (You can also use <@!${bot.user.id}> as a prefix)`,
					`**Type \`${settings.prefix}help [command name]\` for command specific information.**`,
				].join('\n'));
			const categories = bot.commands.map(c => c.help.category).filter((c) => settings.plugins.includes(c)).filter((v, i, a) => a.indexOf(v) === i);
			categories
				.sort((a, b) => a.category - b.category)
				.forEach(category => {
					const commands = bot.commands
						.filter(c => c.help.category === category)
						.sort((a, b) => a.help.name - b.help.name)
						.map(c => `\`${c.help.name}\``).join('**, **');

					const length = bot.commands
						.filter(c => c.help.category === category).size;
					embed.addField(`${category} [**${length}**]`, commands, false);
				});
			message.channel.send(embed);
		} else if (args.length == 1) {
			// Check if arg is command
			if (bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]))) {
				// arg was a command
				const cmd = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
				// Check if the command is allowed on the server
				if (settings.plugins.includes(cmd.help.category) || bot.config.ownerID.includes(message.author.id)) {
					const embed = new MessageEmbed()
						.setTitle(`Command: ${settings.prefix}${cmd.help.name}`)
						.setDescription([
							`**Description:** ${cmd.help.description}`,
							`**Aliases:** ${(cmd.help.aliases.length >= 1) ? cmd.help.aliases.join(', ') : 'None'}`,
							`**Cooldown:** ${cmd.conf.cooldown / 1000} seconds`,
							`**Usage:** ${settings.prefix.concat(cmd.help.usage)}`,
							`**Example:** ${settings.prefix}${cmd.help.examples.join(`,\n ${settings.prefix}`)}`,
							'\n**Layout**: `<> = required, [] = optional`',
						].join('\n'));
					message.channel.send(embed);
				} else {
					message.error(settings.Language, 'MISC/NO_COMMAND');
				}
			} else {
				message.error(settings.Language, 'MISC/NO_COMMAND');
			}
		} else {
			message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage));
		}
	}
};
