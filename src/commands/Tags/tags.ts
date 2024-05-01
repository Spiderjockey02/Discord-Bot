// Dependencies
const { PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Tags command
 * @extends {Command}
*/
export default class Tags extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'tags',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['modifytags', 'tag'],
			userPermissions: [Flags.ManageGuild],
			description: 'Edit server\'s tags',
			usage: 'tag <add/del/edit/view> <required paramters>',
			cooldown: 5000,
			examples: ['tag add java Download Java here: <https://adoptopenjdk.net/>', 'tag rename java Java'],
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
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// make sure something was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('tags/tags:USAGE')) });

		// run subcommands
		const option = message.args[0].toLowerCase();
		message.args.shift();
		switch (option) {
			case 'add':
				await client.commands.get('tag-add').run(client, message, settings);
				break;
			case 'delete':
			case 'del':
				await client.commands.get('tag-delete').run(client, message, settings);
				break;
			case 'edit':
				await client.commands.get('tag-edit').run(client, message, settings);
				break;
			case 'view':
				await client.commands.get('tag-view').run(client, message, settings);
				break;
			default:
			// delete message
				return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('tags/tags:USAGE')) });
		}
	}
}

