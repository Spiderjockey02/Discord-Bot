// Dependencies
const Command = require('../../structures/Command.js');

/**
 * Tags command
 * @extends {Command}
*/
class Tags extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'tags',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['modifytags', 'tag'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Edit server\'s tags',
			usage: 'tag <add/del/edit/view> <required paramters>',
			cooldown: 5000,
			examples: ['tag add java Download Java here: <https://adoptopenjdk.net/>', 'tag rename java Java'],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// make sure something was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('tags/tags:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// run subcommands
		const option = message.args[0].toLowerCase();
		message.args.shift();
		switch (option) {
		case 'add':
			await bot.commands.get('tag-add').run(bot, message, settings);
			break;
		case 'delete':
		case 'del':
			await bot.commands.get('tag-delete').run(bot, message, settings);
			break;
		case 'edit':
			await bot.commands.get('tag-edit').run(bot, message, settings);
			break;
		case 'view':
			await bot.commands.get('tag-view').run(bot, message, settings);
			break;
		default:
			// delete message
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('tags/tags:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = Tags;
