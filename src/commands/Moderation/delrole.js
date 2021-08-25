// Dependencies
const Command = require('../../structures/Command.js');

/**
 * Delrole command
 * @extends {Command}
*/
class DelRole extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'delrole',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['removerole', 'deleterole'],
			userPermissions: ['MANAGE_ROLES'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
			description: 'Delete a role from the server.',
			usage: 'delrole <role>',
			cooldown: 5000,
			examples: ['delrole Test'],
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

		// Make sure a role name was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/delrole:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// find role based on mention, ID or name
		const role = message.getRole();

		// No role was found
		if (!role[0]) return message.channel.error('moderation/delrole:MISSING').then(m => m.timedDelete({ timeout: 5000 }));

		// delete role
		try {
			const delRole = await role[0].delete();
			message.channel.success('moderation/delrole:SUCCESS', { ROLE: delRole.name }).then(m => m.timedDelete({ timeout: 3000 }));
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('moderation/delrole:FAIL').then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = DelRole;
