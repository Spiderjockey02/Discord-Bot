// Dependencies
const path = require('path');

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
		botPermissions = new Array(),
		userPermissions = new Array(),
		examples = new Array(),
		nsfw = false,
		ownerOnly = false,
		cooldown = 3000,
		description = '',
		usage = '',
		slash = false,
		options = new Array(),
	}) {
		const category = (dirname ? dirname.split(path.sep)[parseInt(dirname.split(path.sep).length - 1, 10)] : 'Other');
		this.conf = { guildOnly, userPermissions, botPermissions, nsfw, ownerOnly, cooldown, slash, options };
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

	validate({ content, guild }) {
		const args = content.split(' ');

		if (this.options.length >= 1) {
			for (const option of this.options) {
				const index = this.options.indexOf(option);
				switch (option.type) {
					case 'STRING':

						break;
					case 'INTEGER':
					case 'NUMBER':
						// Make sure, if there is a boundary it's respected.
						if (option.minValue && option.minValue > args[index]) return true;
						if (option.maxValue && option.maxValue > args[index]) return true;
						return false;
					case 'CHANNEL':
					// Check for channel ID or channel mention
						return (guild.channels.cache.get(args[index]) || /^<#[0-9]{18}>/g.match(args[index]));
					case 'ROLE':
					// Check for role ID or channel mention
						return (guild.roles.cache.get(args[index]) || /^<@&[0-9]{18}>/g.match(args[index]));
					default:
						return true;
				}
			}
		} else {
			return true;
		}
	}
}

module.exports = Command;
