// Dependencies
const fs = require('fs'),
	Command = require('../../structures/Command.js');

/**
 * Editrole command
 * @extends {Command}
*/
class EditRole extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'editrole',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['modifyrole'],
			userPermissions: ['MANAGE_ROLES'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
			description: 'Edit a role\'s data in the server',
			usage: 'editrole <role name> <option> <value>',
			cooldown: 5000,
			examples: ['editrole Yellow colour yellow'],
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

		// make sure a role name was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/editrole:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// find role based on mention, ID or name
		const role = message.getRole();

		// No role was found
		if (!role[0]) return message.channel.error('moderation/delrole:MISSING').then(m => m.timedDelete({ timeout: 5000 }));

		if (message.member.permissions.has('ADMINISTRATOR') || role[0].comparePositionTo(message.guild.me.roles.highest) >= 0) {
			switch (message.args[1].toLowerCase()) {
			case 'colour':
			case 'color':
				fs.readFile('./src/assets/json/colours.json', async (err, data) => {
					if (err) {
						bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
						return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
					}

					// Retrieve the names of colours
					const { colourNames } = JSON.parse(data);
					const colour = (message.args[2].toLowerCase()).replace(/\s/g, '');
					if (colourNames[colour] ?? /[0-9A-Fa-f]{6}/g.test(message.args[2])) {
						role[0].edit({ color: colourNames[colour] ?? message.args[2] });
						message.channel.success('moderation/editrole:SUCCESS').then(m => m.timedDelete({ timeout: 3000 }));
					} else {
						return message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'Colour not found' }).then(m => m.timedDelete({ timeout: 5000 }));
					}
				});
				break;
			case 'hoist':
				if (!['true', 'false'].includes(message.args[2])) return message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'Please provide the boolean as a value' }).then(m => m.timedDelete({ timeout: 5000 }));
				role[0].edit({ hoist: message.args[2] });
				message.channel.success('moderation/editrole:SUCCESS').then(m => m.timedDelete({ timeout: 3000 }));
				break;
			case 'name':
			case 'rename':
				if (message.args[2].length >= 100) return message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'The role name is greater than the character limit of (100)' }).then(m => m.timedDelete({ timeout: 5000 }));
				role[0].edit({ name: message.args[2] });
				message.channel.success('moderation/editrole:SUCCESS').then(m => m.timedDelete({ timeout: 3000 }));
				break;
			default:
				message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/editrole:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		}
	}
}

module.exports = EditRole;
