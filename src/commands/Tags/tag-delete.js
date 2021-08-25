// Dependencies
const	{ TagsSchema } = require('../../database/models/index.js'),
	Command = require('../../structures/Command.js');

/**
 * Tag delete command
 * @extends {Command}
*/
class TagDelete extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'tag-delete',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['t-delete', 't-remove', 'tag-del'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Remove a tag from the server',
			usage: 'tag-delete <name>',
			cooldown: 2000,
			examples: ['tag-delete java'],
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
		// delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// make sure something was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('tags/tag-delete:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// try and delete tag
		try {
			const result = await TagsSchema.findOneAndRemove({ guildID: message.guild.id, name: message.args[0] });
			if (result) {
				message.channel.send(message.translate('tags/tag-delete:TAG_DELETED', { TAG: message.args[0] }));
				message.guild.guildTags.splice(message.guild.guildTags.indexOf(message.args[0]), 1);
			} else {
				message.channel.send(message.translate('tags/tag-delete:NO_TAG', { TAG: message.args[0] }));
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = TagDelete;
