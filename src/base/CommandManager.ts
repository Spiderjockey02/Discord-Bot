import { Collection } from 'discord.js';
import Command from 'src/structures/Command';

export default class CommandManager {
	aliases: Collection<string, Command>;
	commands: Collection<string, Command>;
	subCommands: Collection<string, Command>;
	cooldowns: Collection<string, number>;

	constructor() {
		this.aliases = new Collection();
		this.commands = new Collection();
		this.subCommands = new Collection();
		this.cooldowns = new Collection();
	}

	add(cmd: Command) {
		// Check if it's a sub command or not
		if (cmd.conf.isSubCmd) {
			this.subCommands.set(cmd.help.name, cmd);
		} else {
			this.commands.set(cmd.help.name, cmd);
		}

		// Add the aliases
		for (const alias of cmd.help.aliases) {
			this.aliases.set(alias, cmd);
		}
	}

	// eslint-disable-next-line no-empty-function
	delete(cmd: Command) {
		this.commands.delete(cmd.help.name);
	}

	// This will globally disable a command temporarily
	// eslint-disable-next-line no-empty-function
	globallyDisabled() {

	}
}