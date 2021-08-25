// Dependencies
const Command = require('../../structures/Command.js'),
	{ ReactionRoleSchema } = require('../../database/models');

/**
 * Reaction role remove command
 * @extends {Command}
*/
class ReactionRoleRemove extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'rr-remove',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['reactionroles-remove', 'rr-delete'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Make reaction roles',
			usage: 'reactionroles <messagelink>',
			cooldown: 5000,
			examples: ['reactionroles https://discord.com/channels/750822670505082971/761619652009787392/837657228055937054'],
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

		// make sure an arg was sent aswell
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('plugins/rr-remove:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// fetch and validate message
		const patt = /https?:\/\/(?:(?:canary|ptb|www)\.)?discord(?:app)?\.com\/channels\/(?:@me|(?<g>\d+))\/(?<c>\d+)\/(?<m>\d+)/g;
		let msg;
		if (patt.test(message.args[0])) {
			const stuff = message.args[0].split('/');
			try {
				msg = await bot.guilds.cache.get(stuff[4])?.channels.cache.get(stuff[5])?.messages.fetch(stuff[6]);
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			return message.channel.send(message.translate('plugins/rr-add:INVALID'));
		}

		// delete message and then remove database
		try {
			await msg.delete();
			await ReactionRoleSchema.findOneAndRemove({ messageID: msg.id,	channelID: msg.channel.id });
			message.channel.send(message.translate('plugins/rr-remove:SUCCESS'));
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = ReactionRoleRemove;
