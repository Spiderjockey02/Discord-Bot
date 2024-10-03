import { ApplicationCommandOptionType, ApplicationCommandPermissionType, Collection, Message, PermissionsBitField } from 'discord.js';
import { Command, ErrorEmbed } from '../structures';
import EgglordClient from './Egglord';
import { Setting } from '@prisma/client';
import GuildManager from '../accessors/Guild';

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
			return message.channel.isSendable() ? message.channel.send('events/message:GUILD_ONLY') : null;
		}

		const applicationCommands = await message.guild?.commands.fetch();
		const applicationCommand = applicationCommands?.find(c => c.name == command.help.name);

		// Follow the rules of the application command
		if (applicationCommand) {
			const permissionOverwrites = await message.client.application.commands.permissions.fetch({ guild: `${message.guild?.id}` });
			const cmdPermissions = permissionOverwrites.get(applicationCommand.id);

			for (const permission of cmdPermissions ?? []) {
				switch (permission.type) {
					case ApplicationCommandPermissionType.Channel:
						// Check for banned channels
						if (message.channel.id == permission.id && !permission.permission) {
							return message.channel.isSendable() ? message.channel.send('You can\'t run this command in this channel') : null;
						}
						break;
					case ApplicationCommandPermissionType.Role:
						// Check for banned role
						break;
					case ApplicationCommandPermissionType.User:
						if (message.author.id == permission.id && !permission.permission) {
							return message.channel.isSendable() ? message.channel.send('You are blocked from running this command in this server.') : null;
						}
						break;
				}
			}
		} else if (message.inGuild()) {
			const neededPermissions: bigint[] = [];
			command.conf.userPermissions.forEach((perm) => {
				if (message.member && !message.channel.permissionsFor(message.member).has(perm)) {
					neededPermissions.push(perm);
				}
			});

			if (neededPermissions.length > 0) {
				const perms = new PermissionsBitField();
				neededPermissions.forEach((item) => perms.add(item));
				if (message.deletable) message.delete();

				const embed = new ErrorEmbed(message.client, message.guild)
					.setMessage('misc:USER_PERMISSION', { PERMISSIONS: perms.toArray().map((p) => message.client.languageManager.translate(message.guild, `permissions:${p}`)).join(', ') });
				return message.channel.send({ embeds: [embed] });
			}
		}

		// Run the command
		command.run(message.client as EgglordClient, message as Message<true>, settings as Setting);
		this.cooldowns.add(message.author.id);

		// Remove from user from cooldown once finished
		setTimeout(() => {
			this.cooldowns.delete(message.author.id);
		}, message.author.isPremiumTo !== null ? command.conf.cooldown * 0.75 : command.conf.cooldown);
		return true;
	}

	getArgs(command: Command, message: Message) {
		const options = command.conf.options;
		const args = message.content.split(' ').slice(1);

		const response: {[key: string]: any} = {};
		for (const option of options) {
			const arg = args[options.indexOf(option)];

			switch (option.type) {
				case ApplicationCommandOptionType.User: {
					const user = message.guild?.members.cache.get(arg);
					if (!user) return message.channel.isSendable() ? message.channel.send(`${arg} is not a valid user.`) : null;
					response[option.name] = user;
					break;
				}
				case ApplicationCommandOptionType.Role: {
					const role = message.guild?.roles.cache.get(arg);
					if (!role) return message.channel.isSendable() ? message.channel.send(`${arg} is not a valid role.`) : null;
					response[option.name] = role;
					break;
				}
				case ApplicationCommandOptionType.String:
					response[option.name] = args;
					break;
			}
		}

		return response;
	}

	get(cmd: string) {
		return this.commands.get(cmd) || this.subCommands.get(cmd) || this.aliases.get(cmd);
	}

	allNames() {
		return [...this.commands.keys(), ...this.subCommands.keys(), ...this.aliases.keys()];
	}

	async fetchByGuildId(guildId: string) {
		return new GuildManager().fetchCommandsById(guildId);
	}
}