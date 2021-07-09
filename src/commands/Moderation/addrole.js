// Dependencies
const Command = require('../../structures/Command.js'),
	fs = require("fs");

module.exports = class addrole extends Command {
	constructor(bot) {
		super(bot, {
			name: 'addrole',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['createrole'],
			userPermissions: ['MANAGE_ROLES'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
			description: 'Remove warnings from a user.',
			usage: 'addrole <role name> [hex color] [hoist]',
			cooldown: 5000,
			examples: ['addrole Test #FF0000 true'],
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

        if(!message.args[0]) return message.channel.error('misc:ERROR_MESSAGE', { ERROR: "Please provide a name for the role" }).then(m => m.timedDelete({ timeout: 5000 }));

        if(message.args[0].length > 100) return message.channel.error('misc:ERROR_MESSAGE', { ERROR: "The role name is greater than the character limit of (100)" }).then(m => m.timedDelete({ timeout: 5000 }));

		if(Boolean(message.args[2]) === message.args[2] ?? false) return message.channel.error('misc:ERROR_MESSAGE', { ERROR: "Please provide the boolean as a value" }).then(m => m.timedDelete({ timeout: 5000 }));

		fs.readFile('./src/assets/json/colours.json', async (err, data) => {
			if (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			// Retrieve the names of colours
			const { colourNames } = JSON.parse(data);
			const colour = (message.args[1].toLowerCase()).replace(/\s/g, '');
			if(colourNames[colour] ?? /[0-9A-Fa-f]{6}/g.test(message.args[1])) {
				message.guild.roles.create({ name: message.args[0], reason: "Created a new role with the bot", color: colourNames[colour] ?? message.args[1], hoist: message.args[2] ?? false })
				message.channel.success('moderation/kick:SUCCESS', { REASON: "Role successfully created" }).then(m => m.timedDelete({ timeout: 3000 }));
			} else return message.channel.error('misc:ERROR_MESSAGE', { ERROR: "Colour not found" }).then(m => m.timedDelete({ timeout: 5000 }));

		})
	}
};
