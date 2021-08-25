// Dependencies
const Command = require('../../structures/Command.js');

/**
 * Nick command
 * @extends {Command}
*/
class Nick extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'nick',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['nickname', 'setnick'],
			userPermissions: ['CHANGE_NICKNAME', 'MANAGE_NICKNAMES'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_NICKNAMES'],
			description: 'Change the nickname of a user.',
			usage: 'nick <user> <name>',
			cooldown: 3000,
			examples: ['nick username Not a nice name'],
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

		// check if a user was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/ban:USAGE')) }).then(m => m.timedDelete({ timeout: 10000 }));

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER').then(m => m.timedDelete({ timeout: 10000 }));

		// Make sure user user does not have ADMINISTRATOR permissions
		if (members[0].permissions.has('ADMINISTRATOR') || (members[0].roles.highest.comparePositionTo(message.guild.me.roles.highest) > 0)) {
			return message.channel.error('moderation/nick:TOO_POWERFUL').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// Make sure a nickname was provided in the command
		if (message.args.length == 0) return message.channel.error('moderation/nick:ENTER_NICKNAME').then(m => m.timedDelete({ timeout: 10000 }));

		// Get the nickanme
		const nickname = message.content.slice(6).replace(/<[^}]*>/, '').slice(1);

		// Make sure nickname is NOT longer than 32 characters
		if (nickname.length >= 32) return message.channel.error('moderation/nick:LONG_NICKNAME').then(m => m.timedDelete({ timeout: 5000 }));

		// Change nickname and tell user (send error message if dosen't work)
		try {
			await members[0].setNickname(nickname);
			message.channel.success('moderation/nick:SUCCESS', { USER: members[0].user }).then(m => m.timedDelete({ timeout: 5000 }));
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = Nick;
