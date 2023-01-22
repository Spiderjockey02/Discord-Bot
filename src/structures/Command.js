// Dependencies
const path = require('path'),
	{ ApplicationCommandOptionType: CommandOptionType, PermissionsBitField: { Flags } } = require('discord.js');

/**
 * Command structure
 * @abstract
 */
class Command {
	constructor(bot, {
		name = null,
		guildOnly = false,
		dirname = false,
		aliases = new Array(),
		botPermissions = [Flags.SendMessages, Flags.EmbedLinks],
		userPermissions = new Array(),
		examples = new Array(),
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
	async run() {
		throw new Error(`Command: ${this.help.name} does not have a run method`);
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback() {
		throw new Error(`Command: ${this.help.name} does not have a callback method`);
	}

	async getArgs(bot, content, guild) {
		const args = content.split(' '),
			options = this.conf.options,
			res = new Map();
		args.shift();

		if (options?.length == 0) return res;

		for (const option of options) {
			const arg = args[options.indexOf(option)];
			switch (option.type) {
				case CommandOptionType.Subcommand:
					if (!option.choices?.includes(arg)) throw new Error(`${option.name} must be from choices: ${option.choices.join(', ')}`);
					res.set(option.name, arg);
					break;
				case CommandOptionType.String:
					if (option.required && (option.choices && option.choices.length !== 0)) {
						// Check arg is included in choices
						if (!option.choices?.includes(arg)) throw new Error(`${option.name} must be from choices: ${option.choices?.join(', ')}`);
					}

					if (option.minLength < arg?.length || option.maxLength > arg?.length) throw new Error(`${option.name} length must be inbetween ${option.minValue} and ${option.maxValue}.`);

					// Check options
					res.set(option.name, arg ?? null);
					break;
				case (CommandOptionType.Integer || CommandOptionType.Number):
					if (arg && Number(arg)) {
						const value = Number(arg);
						if (option.minValue < value && option.maxValue > value) {
							res.set(option.name, (arg && Number(arg)) ? Number(arg) : null);
						} else {
							throw new Error(`${option.name} must be inbetween ${option.minValue} and ${option.maxValue}.`);
						}
					} else {
						throw new Error(`${option.name} must be type: number.`);
					}
					break;
				case CommandOptionType.Boolean:
					if (typeof JSON.parse(arg) == 'boolean') {
						const value = JSON.parse(arg);
						res.set(option.name, value);
					} else {
						throw new Error(`${option.name} must be type: Boolean.`);
					}
					break;
				case CommandOptionType.User:
					try {
						const user = await guild.members.fetch(arg);
						if (user) {
							res.set(option.name, user);
						} else {
							throw new Error(`${option.name} must be type: User.`);
						}
						break;
					} catch (e) {
						break;
					}
				case CommandOptionType.Channel: {
					const channel = guild.channels.cache.get(arg);
					if (channel) {
						// Check channel Type
						if (!option.channelTypes.includes(channel.type)) throw new Error(`${option.name} must be of type: ${option.channelTypes.join(', ')}`);
						res.set(option.name, channel);
					} else {
						throw new Error(`${option.name} must be type: Channel.`);
					}
					break;
				}
				case CommandOptionType.Role: {
					const role = guild.roles.cache.get(arg);
					if (role) {
						res.set(option.name, role);
					} else {
						throw new Error(`${option.name} must be type: Role.`);
					}
					break;
				}
			}
		}
		return res;
	}

	/**
	 * Function for loading commands to the bot.
	 * @readonly
	*/
	load(bot) {
		const cmd = new (require(`../commands/${this.help.category}${path.sep}${this.help.name}.js`))(bot);
		bot.logger.log(`Loading Command: ${cmd.help.name}.`);
		bot.commands.set(cmd.help.name, cmd);
		cmd.help.aliases.forEach((alias) => {
			bot.aliases.set(alias, cmd.help.name);
		});
	}

	/**
	 * Function for unloading commands to the bot.
	 * @readonly
	*/
	unload() {
		delete require.cache[require.resolve(`../commands/${this.help.category}${path.sep}${this.help.name}.js`)];
	}
}

module.exports = Command;
