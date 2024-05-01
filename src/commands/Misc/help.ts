// Dependencies
const { Embed, paginate } = require('../../utils'),
	{ ApplicationCommandOptionType, GatewayIntentBits } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Help command
 * @extends {Command}
*/
export default class Help extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'help',
			dirname: __dirname,
			description: 'Sends information about all the commands that I can do.',
			usage: 'help [command]',
			cooldown: 2000,
			examples: ['help play'],
			slash: true,
			options: [{
				name: 'command',
				description: 'Name of command to look up.',
				type: ApplicationCommandOptionType.String,
				required: false,
				autocomplete: true,
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(client, message, settings) {
		// show help embed
		const embed = await this.createEmbed(client, settings, message.channel, message.args[0], message.author);
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId);
		const command = args.get('command')?.value;

		if (command) {
			// Check if arg is command
			if (client.commands.get(command) || client.commands.get(client.aliases.get(command))) {
				// arg was a command
				const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
				// Check if the command is allowed on the server
				if (guild.settings.plugins.includes(cmd.help.category) || client.config.ownerID.includes(interaction.user.id)) {
					const embed = new Embed(client, channel.guild)
						.setTitle('misc/help:TITLE', { COMMAND: cmd.help.name })
						.setDescription([
							channel.guild.translate('misc/help:DESC', { DESC: channel.guild.translate(`${cmd.help.category.toLowerCase()}/${cmd.help.name}:DESCRIPTION`) }),
							channel.guild.translate('misc/help:ALIAS', { ALIAS: (cmd.help.aliases.length >= 1) ? cmd.help.aliases.join(', ') : 'None' }),
							channel.guild.translate('misc/help:COOLDOWN', { CD: cmd.conf.cooldown / 1000 }),
							channel.guild.translate('misc/help:USE', { USAGE: guild.settings.prefix.concat(client.translate(`${cmd.help.category.toLowerCase()}/${cmd.help.name}:USAGE`)) }),
							channel.guild.translate('misc/help:EXAMPLE', { EX: `${guild.settings.prefix}${cmd.help.examples.join(`,\n ${guild.settings.prefix}`)}` }),
							channel.guild.translate('misc/help:LAYOUT'),
						].join('\n'));
					interaction.reply({ embeds: [embed] });
				} else {
					interaction.reply({ embeds: [channel.error('misc/help:NO_COMMAND', {}, true)] });
				}
			} else {
				interaction.reply({ embeds: [channel.error('misc/help:NO_COMMAND', {}, true)] });
			}
		} else {
			let categories = client.commands.map(c => c.help.category).filter((v, i, a) => guild.settings.plugins.includes(v) && a.indexOf(v) === i);
			const embeds = [],
				slashCommands = await channel.guild.commands.fetch();

			// Split categories into sections of 4
			categories = categories.reduce((all, one, i) => {
				const ch = Math.floor(i / 4);
				all[ch] = [].concat((all[ch] || []), one);
				return all;
			}, []);

			// Get all command categories
			for (const category of categories) {
				// Check for MessageContent intent (if not don't show message prefix)
				const desc = [];
				if (client.options.intents.has(GatewayIntentBits.MessageContent)) {
					desc.push(...[
						client.translate('misc/help:PREFIX_DESC', { PREFIX: guild.settings.prefix, ID: client.user.id }),
						client.translate('misc/help:INFO_DESC', { PREFIX: guild.settings.prefix, USAGE: client.translate('misc/help:USAGE') }),
						'',
					]);
				}

				// Show all commands in that category
				desc.push(category.map((item) => {
					return [
						`**${item} [${client.commands.filter(c => c.help.category === item).size}]:**`,
						`${client.commands
							.filter(c => c.help.category === item && !c.conf.isSubCmd)
							.sort((a, b) => a.help.name - b.help.name)
							.map(c => {
								const slshCmd = slashCommands.find(i => i.name == c.help.name);
								if (slshCmd) {
									if (c.conf.options[0]?.type == ApplicationCommandOptionType.Subcommand) {
										return c.conf.options.map(i => ` </${c.help.name} ${i.name}:${slshCmd.id}>`);
									} else {
										return ` </${c.help.name}:${slshCmd.id}>`;
									}
								} else {
									return c.help.name;
								}
							})}.`,
					].join('\n');
				}).join('\n'));

				const embed = new Embed(client, channel.guild)
					.setAuthor({ name: client.translate('misc/help:AUTHOR'), iconURL: client.user.displayAvatarURL({ format: 'png' }) })
					.setDescription(
						desc.join('\n'),
					);
				embeds.push(embed);
			}
			paginate(client, interaction, embeds, interaction.user.id);
		}
	}

	/**
	 * Function for handling autocomplete
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @readonly
	*/
	autocomplete(client, interaction) {
		const input = interaction.options.getFocused(true).value,
			commands = client.commands.map(i => ({ name: i.help.name, isSubCmd: i.conf.isSubCmd }))
				.filter(cmd => !cmd.isSubCmd && cmd.name.toLowerCase().startsWith(input.toLowerCase()))
				.slice(0, 10);

		// Send back the responses
		interaction.respond(commands.map(i => ({ name: i.name, value: i.name })));
	}

	/**
	 * Function for creating client about embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {channel} channel The channel the command was ran in
	 * @param {command} command The command to show, if any
	 * @param {user} user The user who ran the command
 	 * @returns {embed}
	*/
	async createEmbed(client, settings, channel, command, user) {
		if (!command) {
			// Show default help page
			const embed = new Embed(client, channel.guild)
				.setAuthor({ name: client.translate('misc/help:AUTHOR'), iconURL: client.user.displayAvatarURL({ format: 'png' }) })
				.setDescription([
					client.translate('misc/help:PREFIX_DESC', { PREFIX: settings.prefix, ID: client.user.id }),
					client.translate('misc/help:INFO_DESC', { PREFIX: settings.prefix, USAGE: client.translate('misc/help:USAGE') }),
				].join('\n'));

			// Determine what categories to show
			let categories = client.commands.map(c => c.help.category).filter((v, i, a) => settings.plugins.includes(v) && a.indexOf(v) === i);
			if (!channel.guild) categories = categories.filter(c => !client.commands.filter(cmd => cmd.help.category === c).first().conf.guildOnly);
			if (client.config.ownerID.includes(user.id)) categories.push('Host');

			// Create the help embed
			const slashCommands = await channel.guild.commands.fetch();
			categories
				.sort((a, b) => a.category - b.category)
				.forEach(category => {
					const commands = client.commands
						.filter(c => c.help.category === category && !c.conf.isSubCmd)
						.sort((a, b) => a.help.name - b.help.name)
						.map(c => {
							const slshCmd = slashCommands.find(i => i.name == c.help.name);
							if (slshCmd) {
								if (c.conf.options[0]?.type == ApplicationCommandOptionType.Subcommand) {
									return c.conf.options.map(i => `</${c.help.name} ${i.name}:${slshCmd.id}>`);
								} else {
									return `</${c.help.name}:${slshCmd.id}>`;
								}
							} else {
								return c.help.name;
							}
						}).join(', ').slice(0, 1023);

					const length = client.commands
						.filter(c => c.help.category === category).size;
					if (category == 'NSFW' && !channel.nsfw) return;
					embed.addFields({ name: `${category} [**${length}**]`, value: `${commands}.` });
				});
			// send message
			return embed;
		} else if (command) {
			// Check if arg is command
			if (client.commands.get(command) || client.commands.get(client.aliases.get(command))) {
				// arg was a command
				const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
				// Check if the command is allowed on the server
				if (settings.plugins.includes(cmd.help.category) || client.config.ownerID.includes(user.id)) {
					return new Embed(client, channel.guild)
						.setTitle('misc/help:TITLE', { COMMAND: cmd.help.name })
						.setDescription([
							channel.guild.translate('misc/help:DESC', { DESC: channel.guild.translate(`${cmd.help.category.toLowerCase()}/${cmd.help.name}:DESCRIPTION`) }),
							channel.guild.translate('misc/help:ALIAS', { ALIAS: (cmd.help.aliases.length >= 1) ? cmd.help.aliases.join(', ') : 'None' }),
							channel.guild.translate('misc/help:COOLDOWN', { CD: cmd.conf.cooldown / 1000 }),
							channel.guild.translate('misc/help:USE', { USAGE: settings.prefix.concat(client.translate(`${cmd.help.category.toLowerCase()}/${cmd.help.name}:USAGE`)) }),
							channel.guild.translate('misc/help:EXAMPLE', { EX: `${settings.prefix}${cmd.help.examples.join(`,\n ${settings.prefix}`)}` }),
							channel.guild.translate('misc/help:LAYOUT'),
						].join('\n'));
				} else {
					return channel.error('misc/help:NO_COMMAND', {}, true);
				}
			} else {
				return channel.error('misc/help:NO_COMMAND', {}, true);
			}
		} else {
			return channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(client.translate('giveaway/g-start:USAGE')) }, true);
		}
	}
}

