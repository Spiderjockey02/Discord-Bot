// Dependencies
const fs = require('fs'),
	Command = require('../../structures/Command.js');

/**
 * Addrole command
 * @extends {Command}
*/
class AddRole extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'addrole',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['createrole'],
			userPermissions: ['MANAGE_ROLES'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
			description: 'Adds a new role to the server',
			usage: 'addrole <role name> [hex color] [hoist]',
			cooldown: 5000,
			examples: ['addrole Test #FF0000 true'],
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
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/addrole:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Max character length of 100 for role name
		if (message.args[0].length >= 100) return message.channel.error('moderation/addrole:MAX_NAME').then(m => m.timedDelete({ timeout: 5000 }));

		// Make sure 'hoist' is true or false
		if (message.args[2] && !['true', 'false'].includes(message.args[2])) return message.channel.error('moderation/addrole:BOOLEAN').then(m => m.timedDelete({ timeout: 5000 }));

		// Make sure there isn't already the max number of roles in the guilds
		if (message.guild.roles.cache.size == 250) return message.channel.error('moderation/addrole:MAX_ROLES').then(m => m.timedDelete({ timeout: 5000 }));

		// Check colour name for role
		fs.readFile('./src/assets/json/colours.json', async (err, data) => {
			if (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			// Create role
			const { colourNames } = JSON.parse(data);
			const colour = (message.args[1]?.toLowerCase())?.replace(/\s/g, '');
			if (colourNames[colour] ?? /[0-9A-Fa-f]{6}/g.test(message.args[1])) {
				const role = await message.guild.roles.create({ name: message.args[0], reason: 'Created a new role with the bot', color: colourNames[colour] ?? message.args[1], hoist: message.args[2] ?? false });
				message.channel.success('moderation/addrole:SUCCESS', { ROLE: role.id }).then(m => m.timedDelete({ timeout: 5000 }));
			} else {
				const role = await message.guild.roles.create({ name: message.args[0], reason: 'Created a new role with the bot', hoist: message.args[2] ?? false });
				message.channel.success('moderation/addrole:SUCCESS', { ROLE: role.id }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		});
	}
}

module.exports = AddRole;
