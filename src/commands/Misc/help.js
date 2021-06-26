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
	async run(bot, message) {
		// show help embed
		const embed = this.createEmbed(bot, message.guild, message.channel, message.args[0], message.author);
		message.channel.send({ embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelID);
		const embed = this.createEmbed(bot, guild, channel, args.get('command')?.value, interaction.member.user);
		bot.send(interaction, { embeds: [embed] });
	}

	// create Help embed
	createEmbed(bot, guild, channel, command, user) {
		if (!command) {
			// Show default help page
			const embed = new Embed(bot, guild)
				.setAuthor(guild.translate('misc/help:AUTHOR'), bot.user.displayAvatarURL({ format: 'png' }))
				.setDescription([
					guild.translate('misc/help:PREFIX_DESC', { PREFIX: guild.settings.prefix, ID: bot.user.id }),
					guild.translate('misc/help:INFO_DESC', { PREFIX: guild.settings.prefix, USAGE: guild.translate('misc/help:USAGE') }),
				].join('\n'));
			const categories = bot.commands.map(c => c.help.category).filter((v, i, a) => guild.settings.plugins.includes(v) && a.indexOf(v) === i);
			if (bot.config.ownerID.includes(user.id)) categories.push('Host');
			categories
				.sort((a, b) => a.category - b.category)
				.forEach(category => {
					const commands = bot.commands
						.filter(c => c.help.category === category)
						.sort((a, b) => a.help.name - b.help.name)
						.map(c => `\`${c.help.name}\``).join('**, **');

					const length = bot.commands
						.filter(c => c.help.category === category).size;
					if (category == 'NSFW' && !channel.nsfw && guild) return;
					embed.addField(`${category} [**${length}**]`, commands);
				});
			// send message
			return embed;
		} else if (command) {
			// Check if arg is command
			if (bot.commands.get(command) || bot.commands.get(bot.aliases.get(command))) {
				// arg was a command
				const cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
				// Check if the command is allowed on the server
				if (guild.settings.plugins.includes(cmd.help.category) || bot.config.ownerID.includes(user.id)) {
					const embed = new Embed(bot, guild)
						.setTitle('misc/help:TITLE', { COMMAND: `${guild.settings.prefix}${cmd.help.name}` })
						.setDescription([
							guild.translate('misc/help:DESC', { DESC: cmd.help.description }),
							guild.translate('misc/help:ALIAS', { ALIAS: (cmd.help.aliases.length >= 1) ? cmd.help.aliases.join(', ') : 'None' }),
							guild.translate('misc/help:COOLDOWN', { CD: cmd.conf.cooldown / 1000 }),
							guild.translate('misc/help:USE', { USAGE: guild.settings.prefix.concat(guild.translate(`${cmd.help.category.toLowerCase()}/${cmd.help.name}:USAGE`)) }),
							guild.translate('misc/help:EXAMPLE', { EX: `${guild.settings.prefix}${cmd.help.examples.join(`,\n ${guild.settings.prefix}`)}` }),
							guild.translate('misc/help:LAYOUT'),
						].join('\n'));
					return embed;
				} else {
					return channel.error('misc/help:NO_COMMAND', {}, true);
				}
			} else {
				return channel.error('misc/help:NO_COMMAND', {}, true);
			}
		} else {
			return channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: guild.settings.prefix.concat(guild.translate('giveaway/g-start:USAGE')) }, true);
		}
	}
};
