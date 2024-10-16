import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, GatewayIntentBits, Guild, Message, User } from 'discord.js';
import { Paginator } from '../../utils';

/**
 * Help command
 * @extends {Command}
*/
export default class Help extends Command {
	constructor(client: EgglordClient) {
		super(client, {
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

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		// show help embed
		if (message.args[0] == null) return this.configurePagination(client, message.guild, message, message.author);

		const embed = await this.createEmbed(client, message.args[0], message.guild);
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const command = interaction.options.getString('command');
		if (command == null) return this.configurePagination(client, interaction.guild, interaction, interaction.user);

		const embed = await this.createEmbed(client, command, interaction.guild);
		interaction.reply({ embeds: [embed] });
	}

	async autocomplete(client: EgglordClient, interaction: AutocompleteInteraction) {
		const input = interaction.options.getFocused(true).value,
			commands = client.commandManager.commands.map(i => ({ name: i.help.name, isSubCmd: i.conf.isSubCmd }))
				.filter(cmd => !cmd.isSubCmd && cmd.name.toLowerCase().startsWith(input.toLowerCase()))
				.slice(0, 10);

		// Send back the responses
		interaction.respond(commands.map(i => ({ name: i.name, value: i.name })));
	}

	/**
	 * Function for creating client about embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {command} command The command to show, if any
	 * @param {user} user The user who ran the command
 	 * @returns {embed}
	*/
	async configurePagination(client: EgglordClient, guild: Guild | null, interaction: ChatInputCommandInteraction | Message, user: User) {
		const categories = [...new Set(client.commandManager.commands.map(c => c.help.category))];
		const embeds = [],
			slashCommands = await guild?.commands.fetch();


		// Split categories into sections of 4
		function chunkArray(arr: string[], chunkSize: number) {
			const result = [];
			for (let i = 0; i < arr.length; i += chunkSize) {
				result.push(arr.slice(i, i + chunkSize));
			}
			return result;
		}
		const chunkedCategories = chunkArray(categories, 4);

		// Get all command categories
		for (const _ of chunkedCategories) {
			// Check for MessageContent intent (if not don't show message prefix)
			const desc = [];
			if (client.options.intents.has(GatewayIntentBits.MessageContent)) {
				desc.push(...[
					client.languageManager.translate(guild, 'misc/help:PREFIX_DESC', { PREFIX: guild?.settings?.prefix, ID: client.user.id }),
					client.languageManager.translate(guild, 'misc/help:INFO_DESC', { PREFIX: guild?.settings?.prefix, USAGE: client.languageManager.translate(guild, 'misc/help:USAGE') }),
					'',
				]);
			}

			// Show all commands in that category
			desc.push(_.map((item) => {
				return [
					`**${item} [${client.commandManager.commands.filter(c => c.help.category === item).size}]:**`,
					`${client.commandManager.commands
						.filter(c => c.help.category === item && !c.conf.isSubCmd)
						.sort((a, b) => a.help.name.localeCompare(b.help.name))
						.map(c => {
							const slshCmd = slashCommands?.find(i => i.name == c.help.name);
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

			const embed = new EgglordEmbed(client, guild)
				.setAuthor({ name: client.languageManager.translate(guild, 'misc/help:AUTHOR'), iconURL: client.user.displayAvatarURL() })
				.setDescription(
					desc.join('\n'),
				);
			embeds.push(embed);
		}
		await Paginator(client, interaction, embeds, user.id);
	}

	async createEmbed(client: EgglordClient, cmdName: string, guild: Guild | null) {
		const command = client.commandManager.get(cmdName);
		if (command) {
			const embed = new EgglordEmbed(client, guild)
				.setTitle('misc/help:TITLE', { COMMAND: command.help.name })
				.setDescription([
					client.languageManager.translate(guild, 'misc/help:DESC', { DESC: client.languageManager.translate(guild, `${command.help.category.toLowerCase()}/${command.help.name}:DESCRIPTION`) }),
					client.languageManager.translate(guild, 'misc/help:ALIAS', { ALIAS: (command.help.aliases.length >= 1) ? command.help.aliases.join(', ') : 'None' }),
					client.languageManager.translate(guild, 'misc/help:COOLDOWN', { CD: command.conf.cooldown / 1000 }),
					client.languageManager.translate(guild, 'misc/help:USE', { USAGE: guild?.settings?.prefix.concat(client.languageManager.translate(guild, `${command.help.category.toLowerCase()}/${command.help.name}:USAGE`)) }),
					client.languageManager.translate(guild, 'misc/help:EXAMPLE', { EX: `${guild?.settings?.prefix}${command.help.examples.join(`,\n ${guild?.settings?.prefix}`)}` }),
					client.languageManager.translate(guild, 'misc/help:LAYOUT'),
				].join('\n'));
			return embed;
		} else {
			const embed = new ErrorEmbed(client, guild)
				.setMessage('misc/help:NO_COMMAND');
			return embed;
		}
	}
}
