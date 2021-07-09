// Dependencies
Command = require('../../structures/Command.js');

module.exports = class addrole extends Command {
	constructor(bot) {
		super(bot, {
			name: 'delrole',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['removerole', 'deleterole'],
			userPermissions: ['MANAGE_ROLES'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
			description: 'Remove warnings from a user.',
			usage: 'delrole <role name>',
			cooldown: 5000,
			examples: ['delrole Test'],
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

        if(!message.args[0]) return message.channel.error('misc:ERROR_MESSAGE', { ERROR: "Please provide the name of the role" }).then(m => m.timedDelete({ timeout: 5000 }));

        const role = message.guild.roles.cache.find(r => r.name.toLowerCase() == message.args[0].toLowerCase()) ?? message.getRoles[0]

        if(!role) return message.channel.error('misc:ERROR_MESSAGE', { ERROR: "Role not found" }).then(m => m.timedDelete({ timeout: 5000 }));

        if (message.member.permissions.has('ADMINISTRATOR') || role.comparePositionTo(message.guild.me.roles.highest) >= 0) {
            role.delete()
            message.channel.success('moderation/kick:SUCCESS', { REASON: "Role successfully created" }).then(m => m.timedDelete({ timeout: 3000 }));
        } else {
            return message.channel.error('misc:ERROR_MESSAGE', { ERROR: "Your role is not high enouigh" }).then(m => m.timedDelete({ timeout: 5000 }));
        }
	}
};
