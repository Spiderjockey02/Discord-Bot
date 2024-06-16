/* eslint-disable @typescript-eslint/no-unused-vars */
// Dependencies
import path from 'path';
import { PermissionFlagsBits, Message, Guild, AutocompleteInteraction, ApplicationCommandOption, ChatInputCommandInteraction } from 'discord.js';
import EgglordClient from '../base/Egglord';
import { CommandConfInterface, CommandConstruct, CommandHelpInterface } from '../types/Structure';
import { Setting } from '@prisma/client';

/**
 * Command structure
*/
export default class Command {
	help: CommandHelpInterface;
	conf: CommandConfInterface;
	constructor({
		name,
		guildOnly = false,
		dirname = '',
		aliases = new Array<string>(),
		botPermissions = [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
		userPermissions = new Array<bigint>(),
		examples = new Array<string>(),
		nsfw = false,
		ownerOnly = false,
		cooldown = 3000,
		description = '',
		usage = '',
		slash = false,
		isSubCmd = false,
		options = new Array<ApplicationCommandOption>(),
	}: CommandConstruct) {
		const category = (dirname ? dirname.split(path.sep).pop() ?? 'Other' : 'Other');
		this.conf = { guildOnly, userPermissions, botPermissions, nsfw, ownerOnly, cooldown, slash, isSubCmd, options };
		this.help = { name, category, aliases, description, usage, examples };
	}

	/**
	 * Function for receiving message.
	 * @param {client} _client The instantiating client
	 * @param {message} _message The message that ran the command
	 * @readonly
	*/
	async run(_client: EgglordClient, _message: Message, _settings?: Setting): Promise<any> {
		throw new Error(`Command: ${this.help.name} does not have a run method`);
	}

	/**
	 * Function for receiving interaction.
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(_client: EgglordClient, _interaction: ChatInputCommandInteraction<'cached'>, _guild?: Guild): Promise<any> {
		throw new Error(`Command: ${this.help.name} does not have a callback method`);
	}

	/**
	 * Function for receiving interaction.
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async autocomplete(_client: EgglordClient, _interaction: AutocompleteInteraction) {
		throw new Error(`Command: ${this.help.name} does not have a callback method`);
	}
}
