// Dependencies
import path from 'path'
import { ApplicationCommandOptionType as CommandOptionType, PermissionsBitField, Message, Client, Guild } from 'discord.js'

/**
 * Command structure
 * @abstract
 */
export default class Command {
	help: { 
		name: string
		category: string
		aliases: string[]
		description: string
		usage: string
		examples: string[]
	}
	conf: { 
		guildOnly: boolean
		userPermissions: bigint[]
		botPermissions: bigint[]
		nsfw: boolean
		ownerOnly: boolean
		cooldown: number
		slash: boolean
		isSubCmd: boolean
		options: any
	}
	constructor({
		name = '',
		guildOnly = false,
		dirname = '',
		aliases = new Array<string>(),
		botPermissions = [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks],
		userPermissions = new Array(),
		examples = new Array<string>(),
		nsfw = false,
		ownerOnly = false,
		cooldown = 3000,
		description = '',
		usage = '',
		slash = false,
		isSubCmd = false,
		options = new Array(),
	}) {
		const category = (dirname ? dirname.split(path.sep)[parseInt(dirname.split(path.sep).length - 1, 10)] : 'Other');
		this.conf = { guildOnly, userPermissions, botPermissions, nsfw, ownerOnly, cooldown, slash, isSubCmd, options };
		this.help = { name, category, aliases, description, usage, examples };
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
	 * @param {message} message The message that ran the command
	 * @readonly
	*/
	async run(_bot: Client, _message: Message) {
		throw new Error(`Command: ${this.help.name} does not have a run method`);
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(_bot: Client, _message: Message, _guild: Guild) {
		throw new Error(`Command: ${this.help.name} does not have a callback method`);
	}

	/**
	 * Function for loading commands to the bot.
	 * @readonly
	*/
	load(bot: Client) {
		const cmd = new (require(`../commands/${this.help.category}${path.sep}${this.help.name}.js`))(bot);
		bot.logger.log(`Loading Command: ${cmd.help.name}.`);

		// Check if it's a subCommand or not
		if (cmd.conf.isSubCmd) {
			bot.subCommands.set(cmd.help.name, cmd);
		} else {
			bot.commands.set(cmd.help.name, cmd);
			cmd.help.aliases.forEach((alias) => {
				bot.aliases.set(alias, cmd.help.name);
			});
		}
	}

	/**
	 * Function for unloading commands to the bot.
	 * @readonly
	*/
	unload() {
		delete require.cache[require.resolve(`../commands/${this.help.category}${path.sep}${this.help.name}.js`)];
	}
}
