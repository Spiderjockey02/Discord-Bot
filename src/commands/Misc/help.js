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
			slash: true,
			options: [{
				name: 'command',
				description: 'Name of command to look up.',
				type: 'STRING',
				required: false,
			}],
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// show help embed
		const embed = this.createEmbed(bot, settings, message.channel, message.args[0], message.author);
		message.channel.send({ embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId);
		const embed = this.createEmbed(bot, guild.settings, channel, args.get('command')?.value, interaction.member.user);
		interaction.reply({ embeds: [embed] });
	}

	// create Help embed
	createEmbed(bot, settings, channel, command, user) {
		if (!command) {
			// Show default help page
			const embed = new Embed(bot)
				.setAuthor(bot.translate('misc/help:AUTHOR'), bot.user.displayAvatarURL({ format: 'png' }))
				.setDescription([
					bot.translate('misc/help:PREFIX_DESC', { PREFIX: settings.prefix, ID: bot.user.id }),
					bot.translate('misc/help:INFO_DESC', { PREFIX: settings.prefix, USAGE: bot.translate('misc/help:USAGE') }),
				].join('\n'));

			// Determine what categories to show
			let categories = bot.commands.map(c => c.help.category).filter((v, i, a) => settings.plugins.includes(v) && a.indexOf(v) === i);
			if (!channel.guild) categories = categories.filter(c => !bot.commands.filter(cmd => cmd.help.category === c).first().conf.guildOnly);
			if (bot.config.ownerID.includes(user.id)) categories.push('Host');

			// Create the help embed
			categories
				.sort((a, b) => a.category - b.category)
				.forEach(category => {
					const commands = bot.commands
						.filter(c => c.help.category === category)
						.sort((a, b) => a.help.name - b.help.name)
						.map(c => `\`${c.help.name}\``).join('**, **');

					const length = bot.commands
						.filter(c => c.help.category === category).size;
					if (category == 'NSFW' && !channel.nsfw) return;
					embed.addField(`${category} [**${length}**]`, `${commands}.`);
				});
			// send message
			return embed;
		} else if (command) {
			// Check if arg is command
			if (bot.commands.get(command) || bot.commands.get(bot.aliases.get(command))) {
				// arg was a command
				const cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
				// Check if the command is allowed on the server
				if (settings.plugins.includes(cmd.help.category) || bot.config.ownerID.includes(user.id)) {
					return new Embed(bot)
						.setTitle('misc/help:TITLE', { COMMAND: cmd.help.name })
						.setDescription([
							bot.translate('misc/help:DESC', { DESC: cmd.help.description }),
							bot.translate('misc/help:ALIAS', { ALIAS: (cmd.help.aliases.length >= 1) ? cmd.help.aliases.join(', ') : 'None' }),
							bot.translate('misc/help:COOLDOWN', { CD: cmd.conf.cooldown / 1000 }),
							bot.translate('misc/help:USE', { USAGE: settings.prefix.concat(bot.translate(`${cmd.help.category.toLowerCase()}/${cmd.help.name}:USAGE`)) }),
							bot.translate('misc/help:EXAMPLE', { EX: `${settings.prefix}${cmd.help.examples.join(`,\n ${settings.prefix}`)}` }),
							bot.translate('misc/help:LAYOUT'),
						].join('\n'));
				} else {
					return channel.error('misc/help:NO_COMMAND', {}, true);
				}
			} else {
				return channel.error('misc/help:NO_COMMAND', {}, true);
			}
		} else {
			return channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(bot.translate('giveaway/g-start:USAGE')) }, true);
		}
	}
};
