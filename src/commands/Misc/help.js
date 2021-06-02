// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Help extends Command {
	constructor(bot) {
		super(bot, {
			name: 'help',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Sends information about all the commands that I can do.',
			usage: 'help [command]',
			cooldown: 2000,
			examples: ['help play'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		if (!message.args[0]) {
			// Show default help page
			const embed = new Embed(bot, message.guild)
				.setAuthor(message.translate('misc/help:AUTHOR'), bot.user.displayAvatarURL({ format: 'png' }))
				.setDescription([
					message.translate('misc/help:PREFIX_DESC', { PREFIX: settings.prefix, ID: bot.user.id }),
					message.translate('misc/help:INFO_DESC', { PREFIX: settings.prefix, USAGE: message.translate('misc/help:USAGE') }),
				].join('\n'));
			const categories = bot.commands.map(c => c.help.category).filter((v, i, a) => settings.plugins.includes(v) && a.indexOf(v) === i);
			if (bot.config.ownerID.includes(message.author.id)) categories.push('Host');
			categories
				.sort((a, b) => a.category - b.category)
				.forEach(category => {
					const commands = bot.commands
						.filter(c => c.help.category === category)
						.sort((a, b) => a.help.name - b.help.name)
						.map(c => `\`${c.help.name}\``).join('**, **');

					const length = bot.commands
						.filter(c => c.help.category === category).size;
					if (category == 'NSFW' && !message.channel.nsfw) return;
					embed.addField(`${category} [**${length}**]`, commands);
				});
			// send message
			message.channel.send(embed);
		} else if (message.args.length == 1) {
			// Check if arg is command
			if (bot.commands.get(message.args[0]) || bot.commands.get(bot.aliases.get(message.args[0]))) {
				// arg was a command
				const cmd = bot.commands.get(message.args[0]) || bot.commands.get(bot.aliases.get(message.args[0]));
				// Check if the command is allowed on the server
				if (settings.plugins.includes(cmd.help.category) || bot.config.ownerID.includes(message.author.id)) {
					const embed = new Embed(bot, message.guild)
						.setTitle('misc/help:TITLE', { COMMAND: `${settings.prefix}${cmd.help.name}` })
						.setDescription([
							message.translate('misc/help:DESC', { DESC: cmd.help.description }),
							message.translate('misc/help:ALIAS', { ALIAS: (cmd.help.aliases.length >= 1) ? cmd.help.aliases.join(', ') : 'None' }),
							message.translate('misc/help:COOLDOWN', { CD: cmd.conf.cooldown / 1000 }),
							message.translate('misc/help:USE', { USAGE: settings.prefix.concat(message.translate(`${cmd.help.category.toLowerCase()}/${cmd.help.name}:USAGE`)) }),
							message.translate('misc/help:EXAMPLE', { EX: `${settings.prefix}${cmd.help.examples.join(`,\n ${settings.prefix}`)}` }),
							message.translate('misc/help:LAYOUT'),
						].join('\n'));
					message.channel.send(embed);
				} else {
					message.channel.error('misc/help:NO_COMMAND');
				}
			} else {
				message.channel.error('misc/help:NO_COMMAND');
			}
		} else {
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-start:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
