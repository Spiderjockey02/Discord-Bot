// Dependencies
const { WarningSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

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

        if(!/[0-9A-Fa-f]{6}/g.test(message.args[1]) ?? "#000000") return message.channel.error('misc:ERROR_MESSAGE', { ERROR: "The hex color provided is invalid" }).then(m => m.timedDelete({ timeout: 5000 }));

        if(Boolean(message.args[2]) === message.args[2] ?? false) return message.channel.error('misc:ERROR_MESSAGE', { ERROR: "Please provide the boolean as a value" }).then(m => m.timedDelete({ timeout: 5000 }));

        message.guild.roles.create({ name: message.args[0], reason: "Created a new role with the bot", color: message.args[1] ?? "#000000", hoist: message.args[2] ?? false })
        message.channel.success('moderation/kick:SUCCESS', { REASON: "Role successfully created" }).then(m => m.timedDelete({ timeout: 3000 }));
	}
};
