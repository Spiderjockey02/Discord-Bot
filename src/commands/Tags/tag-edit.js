// Dependencies
const	{ TagsSchema } = require('../../database/models/index.js'),
	Command = require('../../structures/Command.js');

/**
 * Tag edit command
 * @extends {Command}
*/
class TagEdit extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'tag-edit',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['t-edit'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Edit a tag from this server',
			usage: 'tag-edit <rename / edit> <name> <newName / newResponse>',
			cooldown: 2000,
			examples: ['tag-edit rename java Java', 'tag-edit edit java Java is cool'],
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
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('tags/tag-edit:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Get user options
		let responseString;
		if (message.args[0].toLowerCase() == 'rename') {
			// edit the tag with the new name
			responseString = message.args.slice(2).join(' ');
			if (!message.args[1]) return message.channel.send(message.translate('tags/tag-edit:INVALID_NAME'));
			if (!message.args[2]) return message.channel.send(message.translate('tags/tag-edit:INVALID_NEW_NAME'));
			try {
				await TagsSchema.findOneAndUpdate({ guildID: message.guild.id, name: message.args[1] }, { name: message.args[2] }).then(() => {
					message.channel.send(message.translate('tags/tag-edit:UPDATED_NAME', { NAME: message.args[2] }));
					message.guild.guildTags.splice(message.guild.guildTags.indexOf(message.args[1]), 1);
					message.guild.guildTags.push(message.args[2]);
				});
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else if (message.args[0].toLowerCase() == 'edit') {
			// edit the tag with the new response
			responseString = message.args.slice(2).join(' ');
			if (!message.args[1]) return message.channel.send(message.translate('tags/tag-edit:INVALID_NAME'));
			if (!responseString) return message.channel.send(message.translate('tags/tag-edit:INVALID_NEW_RESP'));
			try {
				await TagsSchema.findOneAndUpdate({ guildID: message.guild.id, name: message.args[1] }, { response: responseString }).then(() => {
					message.channel.send(message.translate('tags/tag-edit:UPDATED_RESP', { NAME: message.args[2] }));
				});
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('tags/tag-edit:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = TagEdit;
