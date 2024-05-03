import { ApplicationCommandPermissionType, Collection, Message } from 'discord.js';
import Command from 'src/structures/Command';
import EgglordClient from './Egglord';
import { Setting } from '@prisma/client';

export default class CommandManager {
	aliases: Collection<string, Command>;
	commands: Collection<string, Command>;
	subCommands: Collection<string, Command>;
	cooldowns: Set<string>;

	constructor() {
		this.aliases = new Collection();
		this.commands = new Collection();
		this.subCommands = new Collection();
		this.cooldowns = new Set();
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

	async verify(message: Message) {
		const args = message.content.split(' ');
		const settings = message.guild?.settings ?? { prefix: 'e!' };

		// Does not start with the command prefix
		if (!message.content.startsWith(settings.prefix)) return false;

		// Not a valid command
		const command = this.commands.get(args[0].slice(settings.prefix.length).toLowerCase());
		if (!command) return false;

		// Check if user is in cooldown
		if (this.cooldowns.has(message.author.id)) return;

		// Check if user is not allowed to interact with the bot (right to restrict processing, abuse etc)

		// Check if command is guildOnly but has been ran in DM
		if (command.conf.guildOnly && message.guild == null) {
			if (message.deletable) message.delete();
			return message.channel.send('events/message:GUILD_ONLY');
		}

		const applicationCommands = await message.guild?.commands.fetch();
		const applicationCommand = applicationCommands?.find(c => c.name == command.help.name);

		// Follow the rules of the application command
		if (applicationCommand) {
			const permissions = await applicationCommand.permissions.fetch({});

			for (const permission of permissions) {
				switch (permission.type) {
					case ApplicationCommandPermissionType.Channel:
						// Check for banned channels
						if (message.channel.id == permission.id && permission.permission == false) {
							return message.channel.send('You can\'t run this command in this channel');
						}
						break;
					case ApplicationCommandPermissionType.Role:
						// Check for banned  role
						break;
					case ApplicationCommandPermissionType.User:
						if (message.author.id == permission.id && permission.permission == false) {
							return message.channel.send('You are blocked from running this command in this server.');
						}
						break;
				}
			}

		} else {
			// Isn't an application command so follow it's own rules (No overwrites)
		}


		// Run the command
		command.run(message.client as EgglordClient, message as Message<true>, settings as Setting);
		this.cooldowns.add(message.author.id);

		// Remove from user from cooldown once finished
		setTimeout(() => {
			this.cooldowns.delete(message.author.id);
		}, (message.author.isPremiumTo !== null ? command.conf.cooldown * 0.75 : command.conf.cooldown));
		return true;
	}
}